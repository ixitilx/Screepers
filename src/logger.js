const LOGLEVEL = 
{
    TRACE   : 0,
    DEBUG   : 10,
    INFO    : 20,
    WARNING : 30,
    ERROR   : 40,
    JSON    : 100,
}

//_.set because intermediate objects in path may not exist
if(!_.has(Memory, 'config.logger.loglevel'))
    _.set(Memory, 'config.logger.loglevel', LOGLEVEL.INFO)

function loglevelToString(loglevel)
{
    switch(loglevel)
    {
        case LOGLEVEL.TRACE: return 'TRACE'
        case LOGLEVEL.DEBUG: return 'DEBUG'
        case LOGLEVEL.INFO: return 'INFO'
        case LOGLEVEL.WARNING: return 'WARNING'
        case LOGLEVEL.ERROR: return 'ERROR'
        case LOGLEVEL.JSON: return 'JSON'
        default: return '' + loglevel
    }
}

function log(loglevel, ...args)
{
    const currentLogLevel = Memory.config.logger.loglevel
    if (currentLogLevel <= loglevel)
        console.log(Game.time, loglevelToString(loglevel), ...args)
}

function logFunc(level)
{
    return (...args) => log(level, ...args)
}

function fallbackToTrace()
{
    const cfg = Memory.config.logger
    if(!_.has(cfg, 'loglevel_fallback'))
    {
        cfg.loglevel_fallback = cfg.loglevel
        cfg.loglevel = LOGLEVEL.TRACE
    }
}

function restoreLoglevel()
{
    const cfg = Memory.config.logger
    if(_.has(cfg, 'loglevel_fallback'))
    {
        cfg.loglevel = _.get(cfg, 'loglevel_fallback', LOGLEVEL.INFO)
        delete cfg.loglevel_fallback
    }
}

function jsonFunc(space)
{
    return (...args) => logJson(space, ...args)
}

function logJson(space, ...args)
{
    args[args.length-1] = JSON.stringify(_.last(args), null, space)
    log(LOGLEVEL.JSON, ...args)
}

function wrapFunc(logLevelOverride)
{
    return (func) => wrap(logLevelOverride, func)
}

function wrap(loglevelOverride, func)
{
    return function(...args)
    {
        const fallback = Memory.config.loglevel
        Memory.config.loglevel = loglevelOverride
        try
        {
            return func.apply(this, args)
        }
        finally
        {
            Memory.config.loglevel = fallback
        }
    }
}



exports.LOGLEVEL = LOGLEVEL

exports.log     = log
exports.trace   = logFunc(LOGLEVEL.TRACE)
exports.debug   = logFunc(LOGLEVEL.DEBUG)
exports.info    = logFunc(LOGLEVEL.INFO)
exports.warning = logFunc(LOGLEVEL.WARNING)
exports.error   = logFunc(LOGLEVEL.ERROR)
exports.json    = jsonFunc(0)
exports.json_p  = jsonFunc(2)

exports.wrapTrace = wrapFunc(LOGLEVEL.TRACE)

exports.fallbackToTrace = fallbackToTrace
exports.restoreLoglevel = restoreLoglevel
