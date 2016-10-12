define(["com/trp/common/util/string"], function (StringUtil) {
    var getDatePrependString = function ()
    {
        var m = new Date();
        var dateString = m.getUTCFullYear() + "/" +
            StringUtil.lpad ("" + (m.getUTCMonth()+1), '0', 2) + "/" +
            StringUtil.lpad ("" + m.getUTCDate(), '0', 2) + " " +
            StringUtil.lpad ("" + m.getUTCHours(), ' ', 2) + ":" +
            StringUtil.lpad ("" + m.getUTCMinutes(), '0', 2) + ":" +
            StringUtil.lpad ("" + m.getUTCSeconds(), '0', 2);

        return (dateString);
    };

    return (
        {
            debug: function (message)
            {
                if (!axis.undef (window.console))
                    window.console.log (getDatePrependString () + ": DEBUG: " + message);
                axis.debug ("DEBUG: " + message);
            },
            info: function (message)
            {
                if (!axis.undef (window.console))
                    window.console.log (getDatePrependString () + ": INFO: " + message);
                axis.debug ("INFO: " + message);
            },
            warn: function (message)
            {
                if (!axis.undef (window.console))
                    window.console.log (getDatePrependString () + ": WARN: " + message);
                axis.debug ("WARN: " + message);
            },
            error: function (message)
            {
                if (!axis.undef (window.console))
                {
                    if (!axis.undef (window.console.error))
                        window.console.error (getDatePrependString () + ": ERROR: " + message);
                    else
                        window.console.log (getDatePrependString () + ": ERROR: " + message);
                    axis.debug ("ERROR: " + message);
                }
            },
            raw: function (message)
            {
                if (!axis.undef (window.console))
                {
                    window.console.log (message);
                    axis.debug ("RAW: " + JSON.stringify (message));
                }
            },
            printStackTrace: function (e)
            {
                if (!axis.undef (e.stack))
                {
                    axis.debugPermanent (": " + e.stack);
                    this.raw (e.stack);
                }
            }
        }
    );
});