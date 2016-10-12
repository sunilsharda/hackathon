define(["com/trp/common/dialog/errorDialog", "ternElapse", "com/trp/common/util/log",
        "com/trp/common/util/base64"], function (ErrorDialog, ternElapse, log, Base64)
    {
        var WAITING_OVERLAY_DELAY_MILLIS = 0;

        var failureFunction = function (e, options)
        {
            if (!axis.undef (options) && options != null)
            {
                var responseText = e.responseText;

                if (responseText == null)
                    responseText = "";

                if (e.status == 500 && responseText.toUpperCase().indexOf ("APPSEC") > -1)
                {
                    var errorDialog = ErrorDialog.create (
                        {
                            statusText: e.statusText,
                            responseText: "Unknown application security error occurred. You will not be able to use AXIS until this error is resolved.\n" +
                                          "Please reach out to the Help Desk and send the error message as well as the Project, Component and Task IDs."
                        }
                    );
                    errorDialog.show();
                }
                else
                {
                    if (!axis.undef(options.failureFunc))
                        options.failureFunc(e);
                    else
                    {
                        var errorDialog = ErrorDialog.create(e);
                        errorDialog.show();
                    }
                }
            }
            else
            {
                var errorDialog = ErrorDialog.create (e);
                errorDialog.show ();
            }
        };

        var showElementOverlay = function (arg)
        {
            if (!axis.undef (arg.options) && arg.options != null)
            {
                if (!axis.undef (arg.options.overlayElement) || !axis.undef (arg.options.overlay))
                {
                    arg.showTheOverlay = true;
                    var elapsorData = {
                        color: '#FFFFFF',
                        opacity: 50,
                        image: 'assets/img/ajax-loader.gif',
                        text: 'Loading...',
                        text_style: {
                            color: '#000',
                            'font-size': 16
                        }
                    };

                    if (!axis.undef (arg.options.overlay))
                    {
                        if (!axis.undef (arg.options.overlay.top))
                            elapsorData.top = arg.options.overlay.top;
                    }

                    setTimeout(function ()
                    {
                        if (arg.showTheOverlay)
                        {
                            if (!axis.undef (arg.options.overlayElement))
                                $(arg.options.overlayElement).elapsor (elapsorData);
                            else
                                $(arg.options.overlay.element).elapsor (elapsorData);
                        }
                    }, WAITING_OVERLAY_DELAY_MILLIS);
                }
            }
        };

        var hideElementOverlay = function (arg)
        {
            if (!axis.undef (arg.options) && arg.options != null)
            {
                if (!axis.undef (arg.options.overlayElement) || !axis.undef (arg.options.overlay))
                {
                    arg.showTheOverlay = false;

                    if (!axis.undef (arg.options.overlayElement))
                        $(arg.options.overlayElement).destroyElapsor ();
                    else
                        $(arg.options.overlay.element).destroyElapsor ();
                }
            }
        };

        return (
            {
                // options must be an object that can contain any of the following:
                //   successFunc:  successFunc (data, textStatus, jqXHR)
                //   failureFunc:  failureFunc (c)
                post: function (url, dto, options, callback)
                {
                    var overlayParm = {
                        options: options
                    };

                    url = this.updateUrlWithParmMap (url, options);
                    showElementOverlay (overlayParm);

                    log.debug ("HTTP POST: " + url);
                    log.raw (dto);

                    $.ajax (
                        url,
                        {
                            cache: false,
                            contentType: "application/json",
                            //data: JSON.stringify (dto),
                            data: encodeURIComponent (JSON.stringify (dto)),
                            type: "POST",
                            processData: false,
                            dataType: "json",
                            async: axis.undef (options.async) ? true : options.async
                        }
                    ).success (function(data, textStatus, jqXHR) {
                        if (!data.success)
                        {
                            failureFunction (
                                {
                                    statusText: data.responseCode,
                                    responseText: data.errorMessage,
                                    errorDialogTitle: "Server Error: URL: " + url
                                }, 
                                options
                            );
                        }
                        else
                        {
                            if (!axis.undef (options) && options != null)
                            {
                                if (!axis.undef (options.successFunc) && !axis.undef (options.elem))
                                    options.successFunc (data, textStatus, jqXHR, options.elem, callback);
                                else if (!axis.undef (options.successFunc))
                                    options.successFunc (data, textStatus, jqXHR, callback);
                            }
                        }
                    }).fail (function(e)
                    {
                        if (axis.undef (options.ignoreErrors) || (!axis.undef (options.ignoreErrors) && !options.ignoreErrors))
                            failureFunction (e, options);
                    }).always (function() {
                        if (!axis.undef (options.alwaysFunc))
                            options.alwaysFunc ();
                        hideElementOverlay (overlayParm);
                    });
                },

                rawPost: function (url, body, options)
                {
                    var overlayParm = {
                        options: options
                    };

                    url = this.updateUrlWithParmMap (url, options);
                    showElementOverlay (overlayParm);

                    log.debug ("HTTP RAW POST: " + url);
                    log.raw (body);

                    $.ajax (
                        url,
                        {
                            cache: false,
                            contentType: options.contentType,
                            data: body,
                            type: "POST",
                            processData: false
                        }
                    ).success (function(data, textStatus, jqXHR) {
                        if (!data.success)
                        {
                            failureFunction (
                                {
                                    statusText: data.responseCode,
                                    responseText: data.errorMessage,
                                    errorDialogTitle: "Server Error: " + url
                                },
                                options
                            );
                        }
                        else
                        {
                            if (!axis.undef (options) && options != null)
                            {
                                if (!axis.undef (options.successFunc))
                                    options.successFunc (data, textStatus, jqXHR);
                            }
                        }
                    }).fail (function(e)
                    {
                        if (axis.undef (options.ignoreErrors) || (!axis.undef (options.ignoreErrors) && !options.ignoreErrors))
                            failureFunction (e, options);
                    }).always (function() {
                        if (!axis.undef (options.alwaysFunc))
                            options.alwaysFunc ();
                        hideElementOverlay (overlayParm);
                    });
                },

                // options must be an object that can contain any of the following:
                //   parmMap: Just a javascript object with name/value pairs that will become the URL parameters.
                //   successFunc:  successFunc (data, textStatus, jqXHR)
                //   failureFunc:  failureFunc (c)
                get: function (url, options)
                {
                    var urlParmString = "";
                    var opts = {}; 
                    if (!axis.undef (options) && options != null)
                    {
                        if (!axis.undef (options.async) && !options.async)
                            opts = {async: false, cache: false, type: "GET"};
                        else
                            opts = {cache: false, type: "GET"};
                    }

                    var overlayParm = {
                        options: options
                    };

                    showElementOverlay (overlayParm);
                    var actualOptions = $.extend (
                        opts,
                        {
                            url: url,
                            data: (!axis.undef (options.parmMap) && options.parmMap != null) ? options.parmMap : {},
                            dataType: 'json'
                        }
                    );
                    log.debug ("HTTP GET: " + url);
                    log.raw (opts.data);
                    $.ajax (
                        actualOptions
                    ).success (function(data, textStatus, jqXHR) {
                        if (!data.success)
                        {
                            failureFunction (
                                {
                                    statusText: data.responseCode,
                                    responseText: data.errorMessage,
                                    errorDialogTitle: "Server Error: " + url
                                }, 
                                options
                            );
                        }
                        else
                        {
                            if (!axis.undef (options) && options != null)
                            {
                                if (!axis.undef (options.successFunc))
                                    options.successFunc (data, textStatus, jqXHR);
                            }
                        }
                    }).fail (function(e)
                    {
                        if (axis.undef (options.ignoreErrors) || (!axis.undef (options.ignoreErrors) && !options.ignoreErrors))
                            failureFunction (e, options);
                    }).always (function() {
                        if (!axis.undef (options.alwaysFunc))
                            options.alwaysFunc ();
                        hideElementOverlay (overlayParm);
                    });
                },

                delete: function (url, businessObject)
                {

                },

                put: function (url, businessObject)
                {

                },

                getUniqueStr: function getUniqueStr ()
                {
                    var date = new Date ();

                    return ("" + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds());
                },

                updateUrlWithParmMap: function (url, options)
                {
                    var urlParmString = "";
                    var opts = {}; 
                    if (!axis.undef (options) && options != null)
                    {
                        if (!axis.undef (options.parmMap) && options.parmMap != null)
                        {
                            var i=0;
                            for (var propt in options.parmMap)
                            {
                                if (i == 0)
                                    urlParmString += (propt + "=" + encodeURIComponent (options.parmMap[propt]));
                                else
                                    urlParmString += "&" + (propt + "=" + encodeURIComponent (options.parmMap[propt]));
                                i++;
                            }

                            url += "?" + urlParmString;
                        }

                        if (!axis.undef (options.async) && !options.async)
                            opts = {async: false, cache: false, type: "GET"};
                        else
                            opts = {cache: false, type: "GET"};
                    }

                    return (url);
                }
            }
        );
    }
);