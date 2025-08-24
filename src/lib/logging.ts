import { supabase } from "@/integrations/supabase/client";

type LogLevel = 'info' | 'warn' | 'error';

const DEDUPE_WINDOW_MS = 30000;
const recentLogs = new Map<string, number>();

function shouldIgnoreLog(level: LogLevel, message: string, params?: { component?: string; route?: string; context?: any; source?: string; }) {
  const filename: string | undefined = params?.context?.filename;
  if (filename?.includes('cdn.gpteng.co/lovable.js') || filename?.includes('lovable.js')) return true;
  if (message?.includes('MutationRecord') && message?.includes('attributeName')) return true;
  return false;
}

function makeLogKey(level: LogLevel, message: string, filename?: string | null) {
  return `${level}|${message}|${filename ?? ''}`;
}


async function log(level: LogLevel, message: string, params?: { component?: string; route?: string; context?: any; source?: string; }) {
  try {
    // Ignore noisy errors from Lovable preview environment and known read-only MutationRecord issues
    if (shouldIgnoreLog(level, message, params)) return;

    const filename = params?.context?.filename ?? null;
    const key = makeLogKey(level, message, filename ?? undefined);
    const now = Date.now();
    const last = recentLogs.get(key);
    if (last && now - last < DEDUPE_WINDOW_MS) {
      return; // skip duplicate within window
    }
    recentLogs.set(key, now);

    const ctx = params?.context ? { ...params.context } : {};
    if (params?.source && params.source !== 'client') {
      (ctx as any).event_source = params.source;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      level,
      message,
      component: params?.component || null,
      route: params?.route || (typeof window !== 'undefined' ? window.location.pathname : null),
      context: Object.keys(ctx).length ? ctx : null,
      source: 'client',
      user_id: user?.id || null,
    } as const;
    await supabase.from('app_logs').insert(payload);
  } catch (e) {
    // swallow
  }
}


export const logInfo = (message: string, params?: Parameters<typeof log>[2]) => log('info', message, params);
export const logWarn = (message: string, params?: Parameters<typeof log>[2]) => log('warn', message, params);
export const logError = (message: string, params?: Parameters<typeof log>[2]) => log('error', message, params);

// Environment-aware console replacement functions
const isProduction = import.meta.env.MODE === 'production';

export const safeConsole = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
    // Always log warnings to our internal system
    logWarn(String(args[0]), { context: { args: args.slice(1) } });
  },
  error: (...args: any[]) => {
    if (!isProduction) {
      console.error(...args);
    }
    // Always log errors to our internal system
    logError(String(args[0]), { context: { args: args.slice(1) } });
  },
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    }
    logInfo(String(args[0]), { context: { args: args.slice(1) } });
  },
  debug: (...args: any[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  }
};

export function installGlobalErrorLogging() {
  if (typeof window === 'undefined') return;
  // avoid double install
  if ((window as any).__kbox_logging_installed) return;
  (window as any).__kbox_logging_installed = true;

  window.addEventListener('error', (event) => {
    logError(event.message || 'Unhandled error', {
      context: {
        filename: (event as any).filename,
        lineno: (event as any).lineno,
        colno: (event as any).colno,
        error: event.error ? { name: event.error.name, message: event.error.message, stack: event.error.stack } : null,
        event_type: 'window.error',
      },
      source: 'client',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = (event as any).reason;
    logError('Unhandled promise rejection', {
      context: {
        reason: typeof reason === 'string' ? reason : { name: reason?.name, message: reason?.message, stack: reason?.stack },
        event_type: 'unhandledrejection',
      },
      source: 'client',
    });
  });
}
