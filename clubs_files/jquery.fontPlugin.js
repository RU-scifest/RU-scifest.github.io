if (fQuery === undefined) {
    fQuery = jQuery;
}
//font control panel plugin
(function ($) {
    /*global document */
    /*global setTimeout */
    /*global setInterval */
    /*global clearTimeout */
    /*global window */
    /*global alert */
    /*global prompt */
    /*global confirm */
    /*global navigator */
    /*global jQuery */
    /*global console */
    /*global $ */
    /*global ajaxproxy */
    /*global location */
    /*global tinyMCE */
    /*global fontBlogUrl */
    /*global fontBlogName */
    /*global clearInterval */
    /*global fontPluginVersion */
    /*global engageCompatibilityMode*/
    /*global ajaxproxy*/
    /*global ajaxproxy2*/
    /*global ajaxproxy3*/
    $.fontPlugin = function (el, options) {
        var self = this;
        self.$el = $(el);
        self.el = el;
        self.baseSelector = '#' + self.$el.attr('id');
        self.$el.data('fontPlugin', self);
        //modal windows array
        self.modals = [];
        self.options = options;
        self.options = $.extend({}, $.fontPlugin.defaultOptions, self.options);
        self.version = fontPluginVersion;
        self.settingFields = [];
        self.effectSliders = [];
        /*
        Initialize
        */
        self.init = function () {
            self.detectMode();
            self.showLoading();
            self.loadSettings();
            if (!$.fn.on) {
                alert('WARNING: You are using an old Wordpress version. It is not guaranteed that the plugin will work. The oldest tested Wordpress version is 3.1 but at least 3.3.1 is recommended.');
            }
            // detect CSS text-shadow support in JavaScript
            if (document.createElement("detect").style.textShadow !== "") {
                alert('Warning: your browser does not support advanced effects and all functions of the plugin. Please upgrade to Chrome, Firefox or Internet Explorer 10');
                return;
            }
        };
        /*
         *
         * MARKUP
         *
         */
        /*
         * Create presets panel
         */
        self.createPresetsPanel = function () {
            var i,
                presetName,
                presetId,
                field,
                paramObj,
                upgrade,
                modalOptions,
                modal;
            /*
            PRESETS
            */
            modalOptions = {
                id: 'presetsPanel',
                name: 'stdSettings',
                title: self.options.compatibilityMode ?  'SAFE MODE!' : 'Font ' + self.version,
                nobar: false,
                left: '10px',
                top: '50px',
                width: '98px',
                show: true
            };
            modal = self.createNewModal(modalOptions);
            modal.show();
            self.$presets = modal;
            //add presets list
            self.settingFields.presets = $('<fieldset id="presetsDropdownFieldset"><label>Selections<select id="presetsDropdown" name="presetsDropdown"></select></label></fieldset>');
            self.$presetsDropdown = self.settingFields.presets.find('select');
            self.$presets.append(self.settingFields.presets);
            self.$presetsDropdown.bind('change', function () {
                self.loadPreset($(this).val());
                self.scrollToSelection();
            });
            //populate presets list
            for (i = 0; i < self.options.presets.length; i += 1) {
                presetName = self.options.presets[i].name;
                presetId = i;
                self.$presetsDropdown.append('<option value="' + presetId + '">' + presetName + '</option>');
            }
            // Delete current preset
            self.settingFields.deletePreset = $('<button id="deletePreset" title="Delete">x</button>');
            self.settingFields.presets.append(self.settingFields.deletePreset);
            self.settingFields.deletePreset.on('click', function () {
                self.deleteCurrentPreset();
            });
            // Rename current preset
            self.settingFields.renamePreset = $('<button id="renamePreset">Rename</button>');
            self.settingFields.presets.append(self.settingFields.renamePreset);
            self.settingFields.renamePreset.on('click', function () {
                self.renamePreset();
            });
        };
        /**
        Like? Yes or No
        **/
        self.addLikeYesNo = function () {
            //add like not/like
            self.$yesno = $('<div class="yesno">Like the plugin?<br><a href="http://fontsforweb.com/purchase/howtosupport?url=' + fontBlogUrl + '&name=' + fontBlogName + '" class="overlay_url yesbutton" data-upgrade="true">Yes!</a> or <a href="http://www.fontsforweb.com/contact/support" class="overlay_url nobutton">No</a></div>');
            self.$yesno.appendTo(self.$actions);
            self.$yesno.css({
                'color': '#fff',
                'font-size': '10px',
                'text-align': 'right',
                'font-weight': 'bold',
                'float': 'left',
                'margin-right': '10px'
            });
            self.$yesno.find('a').css({
                'font-size': '10px',
                'color': '#fff'
            });
        };
        /*
         * Create appearance panel - size and color
         *
         * @returns {unresolved}
         */
        self.createAppearancePanel = function () {
            var i,
                presetName,
                presetId,
                field,
                paramObj,
                saveButton,
                upgrade,
                modalOptions,
                modal,
                settingWindows;
            /*
            SELECTORS
            */
            //get standard fields in a new window
            modalOptions = {
                id: 'appearancePanel',
                name: 'stdSettings',
                title: 'Size and color settings',
                left: '0',
                top: '0px',
                width: '100%',
                nobar: true,
                show: true
            };
            modal = self.createNewModal(modalOptions);
            self.$apr = modal;
            self.$apr.hide();
            //create a fieldset
            self.$standardFields = $('<div id="appearanceStandardFields"></div>').appendTo(modal);
            //get standard fields in a new window
            modalOptions = {
                title: 'Extended settings',
                left: '0',
                top: '0'
            };
            modal = self.createNewModal(modalOptions);
            self.$extendedFields = $('<div id="appearanceExtendedFields"></div>').appendTo(modal);
            //get extended fields not ready
            /*var switcher = $('<a href="#" id="showExtendedFields">Load extended fields from FontsForWeb.com</a>').appendTo(self.$apr);
            self.$extendedFields.hide();
            switcher.on('click', function () { self.$extendedFields.slideToggle(); self.loadExtendedFields(); return false; });*/
            /*
            Add all setting fields
            */
            for (i = 0; i < self.options.settingFields.length; i += 1) {
                field = self.options.settingFields[i];
                paramObj = {};
                paramObj.field = field;
                paramObj.type = 'lite';
                self.addSettingsField(paramObj);
            }
            //add window opening buttons
            settingWindows = $('<fieldset id="settingsButtons"></fieldset>');
            //bind toggle modal
            $('body').on('click', '.toggleModal', function () {
                if (self.mode === 'global') {
                    var selector = self.currentPreset.selector;
                    if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                        alert('First pick an element from the page to customize it.');
                        return;
                    }
                } else if (self.mode === 'postPage') {
                    //VERSION FOR POST PAGE
                    //get selection
                    var selection = tinyMCE.activeEditor.selection.getContent();
                    //only apply if something is selected
                    if (!selection) {
                        alert('Make a selection in the editor window first.');
                        return;
                    }
                }
                var modalName = $(this).attr('data-modal-name');
                self.toggleModal(modalName);
            });
            $('body').on('mousedown click', '.getApiKey', function () {
                $(this).attr('href', 'http://fontsforweb.com/purchase?url=' + fontBlogUrl);
                $(this).attr('target', '_blank');
            });
            //add keyup to change field
            self.getField('selector').bind('keyup', function () {
                $(this).trigger('change');
                self.hoverSelector = self.currentPreset.selector;
                self.hoverHighlightCurrent();
            });
        };
        self.createActionButtons = function () {
            var saveButton,
                actions,
                closeMod;
            //add buttons fieldset
            actions = $('<fieldset id="actionsFieldset"></fieldset>');
            closeMod = $('<a class="closeModal" href="#">x</a>');
            actions.append(closeMod);
            self.$actions = actions;
            closeMod.click(function () {
                self.$presets.hide();
                self.$apr.hide();
            });
            //add different fields buttons
            var fontfaceSettings = $('<button id="fontfaceSettings">Font</button>').prependTo(self.$apr);
            //add actions
            fontfaceSettings.on('click', function () {
                if (self.mode === 'global') {
                    var selector = self.currentPreset.selector;
                    if (selector.indexOf('ELEMENT NOW') !== -1 || selector.indexOf('PICK ELEMENT') !== -1) {
                        alert('First pick an element from the page to customize it.');
                        return;
                    }
                } else if (self.mode === 'postPage') {
                    //VERSION FOR POST PAGE
                    //get selection
                    var selection = tinyMCE.activeEditor.selection.getContent();
                    //only apply if something is selected
                    if (!selection) {
                        alert('Make a selection in the editor window first.');
                        return;
                    }
                }
                self.showFontsBrowser();
            });
            // PRO settings window
            var proSettings = $('<a href="http://fontsforweb.com/purchase/pluginupgradesubscribe?url=' + fontBlogUrl + '&name=' + fontBlogName + '" class="overlay_url" id="upgradeToProButton" data-upgrade="true">Pro settings</a>').appendTo(self.$apr);
            // extra fields
            var extrafieldsSettings = $('<button id="extrafieldsSettings" class="toggleModal" data-modal-name="extrafields">PRO</button>').appendTo(self.$apr);
            // hide extra fields
            extrafieldsSettings.hide();
            // effects button
            var effects = $('<button id="effectsButton" class="toggleModal" data-modal-name="effects">Effects</button>').appendTo(self.$apr);
            // styles button
            var styles = $('<button id="stylesButton" class="toggleModal" data-modal-name="styles">Styles</button>').appendTo(self.$apr);

            //add save button
            saveButton = $('<button id="fontSaveSettings">Save settings</button>').appendTo(actions);
            saveButton.click(function (e) {
                // blink few fimes
                saveButton.fadeTo(500, 0.3).fadeTo(500, 1).fadeTo(500, 0.3).fadeTo(500, 1).fadeTo(500, 0.3).fadeTo(500, 1).fadeTo(500, 0.3).fadeTo(500, 1).fadeTo(500, 0.3).fadeTo(500, 1);
                //unbind click
                saveButton.unbind('click');
                saveButton.css({
                    'cursor': 'wait'
                });
                self.saveSettings();
            });
            self.$apr.append(actions);
        };
        /*
         * API FUNCTIONS
         */
        /*
         * check if api key is present in the database
         */
        self.checkForApikey = function () {
            self.xhrPost({
                url: self.options.FFW_baseUrl + '/api/getkey',
                data: {
                    blogurl: fontBlogUrl,
                    apikey: self.options.apikey,
                    version: self.version
                }
            }, function (data) {
                if (!data || data.success !== 'true') {
                    if (console !== undefined) {
                        console.log(data.message);
                    }
                    alert('An error has occured and the plugin is not working. If you\'re working on local server, make sure \n that your computer has an internet connection.');
                } else {
                    if(data.keytype === 'FREE' && self.loaded === true) {
                        return;
                    }
                    self.loadEffectsPanel(data.effects);
                    if (data.extended.length) {
                        self.loadExtendedFields(data.extended);
                        $('#upgradeToProButton').remove();
                        $('#extrafieldsSettings').show();
                        clearInterval(self.checkForApikeyInterval);
                    }
                    self.loadStylesPanel(data.styles);
                    self.options.apikey = data.apikey;
                    self.loaded = true;
                }
            });
        };
        //setup api key interval
        self.setupApikeyCheckingInterval = function () {
            if (!self.checkForApikeyInterval) {
                self.checkForApikeyInterval = setInterval(function () {
                    self.checkForApikey();
                }, 5000);
            }
        };
        /*
         * SETTINGS - SAVE AND LOAD
         */
        /*
         * Load settings from wordpress options
         */
        self.loadSettings = function () {
            var data = {
                action: 'get_font_settings'
            };
            $.ajax({
                type: "POST",
                url: ajaxproxy,
                data: data,
                success: function (response) {
                    // json is coming parsed so no $.parseJSON(response);
                    try {
                        response = $.parseJSON(response);
                    } catch (e) {
                        self.tryAnotherAjaxproxy();
                        return;
                    }
                    //console.log(self.options);
                    if (response && response.settingFields) {
                        self.options = $.extend({}, response, self.options);
                    } else {
                        self.tryAnotherAjaxproxy();
                        return;
                    }
                    self.loadConfig();
                },
                error: function (response) {
                    self.tryAnotherAjaxproxy();
                }
            });
        };
        self.tryAnotherAjaxproxy = function () {
            if (ajaxproxy === ajaxproxy3) {
                alert('Sorry, but the plugin couldn\'t start. Please contact your server administrator to allow AJAX use. Power users: Use console (F12 in Chrome) to see what else could be the problem.');
                return;
            }
            else if (ajaxproxy === ajaxproxy2) {
                ajaxproxy = ajaxproxy3;
            } else {
                ajaxproxy = ajaxproxy2;
            }
            self.loadSettings();
        };


        /**
        *
        * continue loading with config file
        *
        **/
        self.loadConfig = function () {
            // try loading the plugin
            try {
                //console.log(self.options);
                self.hideLoading();
                // markup
                self.createPresetsPanel();
                self.createAppearancePanel();
                self.createActionButtons();
                self.loadPreset(0);
                self.bindShowCategoriesAction();
                self.bindShowFontsAction();
                self.bindLinkOverlay();
                self.setFontOnclick();
                self.initUploadForm();
                self.adaptOptionsToMode();
                self.addLikeYesNo();
                self.checkForApikey();
                if (self.options.presets && self.options.presets[1]) {
                    self.loadPreset(1);
                }
            } catch (e) {
                console.dir(e);
                fQuery('#FFW_chooseFontButton, #content_FFWButton, #wp-admin-bar-font_settings > a').unbind();
                fQuery('#fontplugin').data('fontPlugin', false);
                engageCompatibilityMode(function () {
                    fQuery('#wp-admin-bar-font_settings > a').trigger('click');
                }, e);
            }
        },
        /*
         * Save settings by ajax
         *
         * @returns {unresolved}
         */
        self.saveSettings = function () {
            var savingOptions = {},
                data;
            if (self.mode === 'postPage') {
                alert('Click on "Update" or "Publish" to save');
                return;
            }
            self.$presets.hide();
            self.$apr.hide();
            self.showLoading();
            savingOptions.settingFields = self.options.settingFields;
            savingOptions.presets = self.options.presets;
            savingOptions.apikey = self.options.apikey;
            data = {
                action: 'set_font_settings',
                fontPluginSettings: JSON.stringify(savingOptions)
            };
            $.post(ajaxproxy, data, function (response) {
                if (response.success !== 'true') {
                    alert('Error: ' + response.message);
                    return;
                } else {
                    window.onbeforeunload = null;
                    location.reload(true);
                }
            }, 'json').error(function (xhr, textStatus, errorThrown) {
                alert("Unknown error: \n" + xhr.responseText);
            });
        };
        //update internal settings - value
        self.updateSettings = function (settingName, value) {
            if (self.mode !== 'global') {
                return;
            }
            self.options.presets[self.currentPresetNo][settingName] = value;
        };
        //update internal settings - css value
        self.updateCssSettings = function (settingName, value) {
            if (self.mode !== 'global') {
                return;
            }
            self.options.presets[self.currentPresetNo].styles[settingName] = value;
        };
        /*
        update selected element CSS
        global - update element from selector
        postPage - update selected text
        */
        self.updateSelectedElement = function (settingName, value) {
            var selection,
                selector,
                selectorValid,
                $selectorContents,
                element,
                node,
                justInsertedClass,
                newSpan,
                newHTML,
                inserted,
                $tempDiv;
            if (!value || value == 'px') return;
            if (self.mode === 'global') {
                //VERSION FOR GENERAL SETTINGS PAGE
                selector = self.currentPreset.selector;
                //exit when default selector
                if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                    return;
                }
                //get the element from iframe or current page
                if ($("#header1preview").length) {
                    element = $("#header1preview").contents().find(selector);
                } else {
                    element = $(selector);
                }
                element.each(function () {
                    //CSS exceptions and general action
                    switch (settingName) {
                    case 'rotate':
                        $(this).style('-webkit-transform', 'rotate(' + value + 'deg)', 'important');
                        $(this).style('-moz-transform', 'rotate(' + value + 'deg)', 'important');
                        $(this).style('-o-transform', 'rotate(' + value + 'deg)', 'important');
                        $(this).style('-ms-transform', 'rotate(' + value + 'deg)', 'important');
                        $(this).style('transform', 'rotate(' + value + 'deg)', 'important');
                        break;
                        //general action
                    default:
                        $(this).style(settingName, value, 'important');
                    }
                });
            } else if (self.mode === 'postPage') {
                //VERSION FOR POST PAGE
                //get selection
                selection = tinyMCE.activeEditor.selection.getContent();
                //only apply if something is selected
                if (!selection) {
                    return;
                }
                //selectorValid - validate selector created from selected text. 
                //required because for example "." with nothing following breaks function execution
                selectorValid = true;
                try {
                    $selectorContents = $(selection);
                } catch (e) {
                    selectorValid = false;
                }
                if (selectorValid && $selectorContents.length > 1) {
                    selectorValid = false;
                }
                //get node
                node = tinyMCE.activeEditor.selection.getNode();
                if (selectorValid && ($.trim($(node).html()) === $.trim(selection) || $.trim($(node).html()) === $.trim($(selection).html()))) {
                    //console.log('already isolated');
                    tinyMCE.activeEditor.dom.setStyle(node, settingName, value);
                } else {
                    //console.log('isolating: ' + $(node).html() + ' - ' + selection);
                    justInsertedClass = 'inserted' + Math.floor(Math.random() * 10000);
                    newSpan = $('<span id="' + justInsertedClass + '">' + selection + '</span>');
                    newSpan.css(settingName, value);
                    $tempDiv = $('<div>').append(newSpan.clone());
                    $tempDiv.find('*').each(function () {
                        //if ($(this).inlineStyle && $(this).inlineStyle(settingName)) {
                            $(this).css(settingName, value);
                        //}
                    });
                    //get span html together with span itself
                    newHTML = $tempDiv.html();
                    inserted = tinyMCE.activeEditor.selection.setContent(newHTML);
                    tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('span#' + justInsertedClass)[0]);
                }
            }
        };
        /*
         *
         * FIELDS
         *
         */
        /*
         * Load extended fields
         */
        self.loadExtendedFields = function (data) {
            var i,
                field,
                paramObj,
                modalOptions,
                modal;
            //create a new modal for it
            modalOptions = {
                name: 'extrafields',
                title: 'Pro options',
                left: '5px',
                top: '40px',
                width: '270px'
            };
            modal = self.createNewModal(modalOptions);
            for (i = 0; i < data.length; i += 1) {
                field = data[i];
                paramObj = {};
                paramObj.field = field;
                paramObj.type = 'extrafields';
                self.addSettingsField(paramObj);
            }
            self.reloadPreset();
        };
        /*
         * Add a field to selected place
         * paramObj
         *
         * @returns {unresolved}
         *  .field - field definition - no data or assignations here
         *    .settings - contain field settings
         */
        self.addSettingsField = function (paramObj, loadDefaults) {
            var field = paramObj.field,
                thisField,
                thisInput,
                i,
                manipulator,
                fieldset,
                fieldParam,
                container,
                inputFields = [];
            if (loadDefaults === undefined) {
                loadDefaults = false;
            }
            //add support for multi value field
            if (field.settingType === 'cssmultival') {
                if (!paramObj.target) {
                    //create a new modal for it
                    var modalOptions = {
                        name: field.name,
                        title: field.label,
                        left: '0',
                        top: '50px',
                        width: '270px'
                    };
                    container = self.createNewModal(modalOptions);
                } else {
                    container = paramObj.target;
                }
                //create a fieldset
                fieldset = self.settingFields[field.name] = $('<fieldset id="' + field.name + 'Fieldset"></fieldset>');
                //add fieldset to extended fields
                container.append(fieldset);
                var XYSliderOptions = false;
                //add all controls
                for (i = 0; i < field.values.length; i += 1) {
                    fieldParam = field.values[i];
                    var privateInputField = thisInput;
                    var subfield = fieldParam;
                    //create a field with label around
                    var manipulator = $('<label>' + subfield.label + '<a class="resetField">reset</a><input type="' + subfield.type + '" title="' + subfield.settingName + '"></label>');
                    manipulator.appendTo(fieldset);
                    privateInputField = manipulator.find('input');
                    privateInputField.data('fieldInfo', subfield);
                    privateInputField.data('settings', paramObj.settings);
                    // ADD CORRESPONDING ENTRY IN FIELD SETTINGS
                    if (paramObj.settings && !paramObj.settings.params) {
                        var params = {};
                        paramObj.settings.params = params;
                    }
                    //append field to extended list
                    fieldset.append(thisField);
                    //extend field with whatever
                    privateInputField = self.extendField(privateInputField, subfield.extendWith);
                    // if handle is assigned add actions
                    if (subfield.handle) {
                        if (!XYSliderOptions) {
                            XYSliderOptions = {};
                            XYSliderOptions.actions = [];
                        }
                        // action can be x, y, deg, distance
                        // stop - last action don't trigger input change
                        XYSliderOptions.id = privateInputField.data('settings').uniqueId;
                        inputFields[subfield.handle.linkTo] = privateInputField;
                    }
                }
                var XYSlider = false;
                if (XYSliderOptions) {
                    var rand = Math.random() * 1000,
                        stop = true;
                    // if xy slider set then add it
                    XYSliderOptions.label = field.label;
                    if (field.invertX) {
                        XYSliderOptions.invertX = true;
                    }
                    XYSliderOptions.settingName = paramObj.settings.uniqueId;
                    var Mathra = Math.random();
                    XYSliderOptions.actions = function (x, y, deg, distance) {
                        inputFields['x'] ? (
                            inputFields['x'].val(x),
                            inputFields['x'].trigger('change', stop)
                        ) : false;
                        inputFields['y'] ? (
                            inputFields['y'].val(y),
                            inputFields['y'].trigger('change', stop)
                        ) : false;
                        inputFields['deg'] ? (
                            inputFields['deg'].val(deg),
                            inputFields['deg'].trigger('change', stop)
                        ) : false;
                        inputFields['distance'] ? (
                            inputFields['distance'].val(distance / 2),
                            inputFields['distance'].trigger('change', stop)
                        ) : false;
                    };
                    //XYSliderOptions.target = paramObj.target;
                    var $XYSlider = self.currentElement.XYSlider(XYSliderOptions);
                    XYSlider = $XYSlider.data('XYSlider');
                    //add to effect handles
                    self.effectSliders[paramObj.settings.uniqueId] = XYSlider.$handleHolder;
                    if (!paramObj.settings.enabled) {
                        self.effectSliders[paramObj.settings.uniqueId].hide();
                    }
                }
                //bind action to the inputs
                var inputs = fieldset.find('input');
                //bind change to inputs
                inputs.bind('change click keyup', function (event, stop) {
                    // settings 
                    var settings = $(this).data('settings'),
                        fieldInfo = $(this).data('fieldInfo'),
                        storage = $(this).data('storage'),
                        val = $(this).val(),
                        XYSliderX,
                        XYSliderY;
                    if (stop === undefined) stop = false;
                    // add arrow up - down support
                    //37 - left, 38 - up, 39 - right, 40 - down
                    if (event.which === 38 && !isNaN(val)) {
                        $(this).val(parseFloat(val) + 1);
                        $(this).trigger('change');
                        return false;
                    } else if (event.which === 40 && !isNaN(val)) {
                        $(this).val(parseFloat(val) - 1);
                        $(this).trigger('change');
                        return false;
                    }
                    // save param setting
                    settings.params[fieldInfo.settingName] = val;
                    
                    //console.log($(this).data('fieldInfo').settingName + ', ' + $(this).val() + ', ' + ($(this).data('fieldInfo').unit || ''))
                    //get values of all siblings and create one value for the element
                    var completeValue = '';
                    inputs.each(function () {
                        var fieldInfo = $(this).data('fieldInfo'),
                            unit = '';
                        if (fieldInfo.unit) {
                            unit = fieldInfo.unit;
                        }
                        //get field info
                        completeValue += ' ' + $(this).val() + unit;
                        if ($(this).val() == '') {
                            $(this).val(fieldInfo['default']);
                        }
                        if (XYSlider && !stop && fieldInfo.handle) {
                            if (fieldInfo.handle.linkTo === 'x') {
                                XYSliderX = $(this).val();
                            } else if (fieldInfo.handle.linkTo === 'y') {
                                XYSliderY = $(this).val();
                            }
                        }
                    });
                    // when changing value of the input move the handle too
                    // if this input is linked to a handle
                    if (XYSlider && !stop && fieldInfo.handle) {
                        // get "linked to" of a handle and move x or y accordingly
                        if (XYSliderX && XYSliderY) {
                            XYSlider.setPosition(XYSliderX, XYSliderY);
                        } else if (XYSliderX) {
                            XYSlider.setPosition(XYSliderX, false);
                        } else if (XYSliderY) {
                            XYSlider.setPosition(false, XYSliderY);
                        }
                    }
                    // when changing value of the input move the handle too
                    // if this input is linked to a handle
                    /*if (XYSlider && !stop && fieldInfo.handle) {
                        // get "linked to" of a handle and move x or y accordingly
                        if (fieldInfo.handle.linkTo === 'x') {
                            XYSlider.setPosition($(this).val(), false);
                        } else if (fieldInfo.handle.linkTo === 'y') {
                            XYSlider.setPosition(false, $(this).val());
                        }
                    }*/
                    // if this is text-shadow
                    if (field.settingName === 'text-shadow') {
                        //var effect = self.getElementsEffect(settings.uniqueId);
                        completeValue = completeValue.replace(/, +$/, '');
                        var XYSliderValues = XYSlider.getCurrentValues();
                        self.drawEffects({
                            completeValue: completeValue,
                            target: self.currentElement,
                            color: settings.params.color,
                            x: -XYSliderValues.x,
                            y: XYSliderValues.y,
                            deg: 180 - XYSliderValues.deg * -1,
                            distance: XYSliderValues.distance,
                            effectId: settings.uniqueId,
                            effectsList: ['textShadow']
                        });
                    } else if (field.settingName === 'text-stroke') {
                        // go through all settings
                        //var effect = self.getElementsEffect(settings.uniqueId);
                        completeValue = completeValue.replace(/, +$/, '');
                        //var XYSliderValues = XYSlider.getCurrentValues();
                        self.drawEffects({
                            target: self.currentElement,
                            color: settings.params.color,
                            distance: settings.params.width,
                            effectId: settings.uniqueId,
                            spread: settings.params.spread,
                            effectsList: ['stroke']
                        });
                    } else if (field.settingName === 'text-extrude') {
                        var XYSliderValues = XYSlider.getCurrentValues();
                        self.drawEffects({
                            target: self.currentElement,
                            color: settings.params.color,
                            deg: 180 - XYSliderValues.deg * -1,
                            distance: XYSliderValues.distance,
                            effectId: settings.uniqueId,
                            effectsList: ['extrude3d']
                        });
                    } else if (field.settingName === 'text-extrude-shadow') {
                        var XYSliderValues = XYSlider.getCurrentValues();
                        self.drawEffects({
                            color: settings.params.color,
                            target: self.currentElement,
                            deg: 180 - XYSliderValues.deg * -1,
                            distance: XYSliderValues.distance,
                            effectId: settings.uniqueId,
                            effectsList: ['extrude3d', 'shadow3d']
                        });
                    } else if (field.settingName === 'text-shadow-multiple') {
                        var XYSliderValues = XYSlider.getCurrentValues();
                        self.drawEffects({
                            target: self.currentElement,
                            color: settings.params.color,
                            opacity: settings.params.opacity,
                            deg: 180 - XYSliderValues.deg * -1,
                            distance: XYSliderValues.distance,
                            effectId: settings.uniqueId,
                            effectsList: ['shadow3d']
                        });
                    } else {
                        //console.log(field.settingName + ': ' + completeValue);
                        self.updateCssSettings(field.settingName, completeValue);
                        self.updateSelectedElement(field.settingName, completeValue);
                    }
                    return false;
                });
                
                // load defaults
                if (loadDefaults) {
                    for(var i = 0; i < inputs.length; i++) {
                        inputs.eq(i).trigger('change');
                    }
                    //
                    inputs.eq(0).trigger('change');
                }
                
                //reset field button action
                fieldset.find('a.resetField').click(function () {
                    thisInput.val('');
                    thisInput.trigger('change');
                    alert('When resetting settings or deleting preset you have to save to see the change');
                });
            } else {
                self.settingFields[field.name] = $('<fieldset id="' + field.name + 'Fieldset"><label>' + field.label + '<a class="resetField">reset</a><input type="' + field.type + '" name="' + field.name + '" title="' + field.settingName + '" id="' + field.name + 'Field"></label></fieldset>');
                thisField = self.settingFields[field.name];
                thisInput = self.getField(field.name);
                thisInput.data('fieldInfo', field);
                if (paramObj.target) {
                    paramObj.target.append(thisField);
                } else if (paramObj.type === 'premium') {
                    self.$extendedFields.append(thisField);
                } else if (paramObj.type === 'extrafields') {
                    self.modals['extrafields'].append(thisField);
                } else {
                    if (field.name === 'selector') {
                        thisField.insertAfter('#presetsDropdownFieldset');
                    } else {
                        self.$standardFields.append(thisField);
                    }
                }
                //reset field button action
                thisField.find('a.resetField').click(function () {
                    thisInput.val(0);
                    thisInput.trigger('change');
                    thisInput.val('none');
                    thisInput.trigger('change');
                    thisInput.val('inherit');
                    thisInput.trigger('change');
                    thisInput.val('');
                    thisInput.trigger('change');
                });
                if (field.settingType === 'dropdown') {
                    thisInput = self.extendField(thisInput, 'dropdown');
                } else {
                    thisInput = self.extendField(thisInput, field.extendWith);
                }
                //general actions - apply settings
                if (field.settingType === 'css' || field.settingType === 'dropdown') {
                    //bind change to color picker
                    thisInput.bind('change click keyup', function () {
                        //console.log($(this).data('fieldInfo').settingName + ', ' + $(this).val() + ', ' + ($(this).data('fieldInfo').unit || ''))
                        self.updateCssSettings($(this).data('fieldInfo').settingName, $(this).val());
                        self.updateSelectedElement($(this).data('fieldInfo').settingName, $(this).val() + ($(this).data('fieldInfo').unit || ''));
                        return false;
                    });
                } else if (field.settingType === 'csstransform') {
                    //bind change to color picker
                    thisInput.bind('change click keyup', function () {
                        //console.log($(this).data('fieldInfo').settingName + ', ' + $(this).val() + ', ' + ($(this).data('fieldInfo').unit || ''))
                        self.updateCssSettings($(this).data('fieldInfo').settingName, $(this).val());
                        self.updateSelectedElement($(this).data('fieldInfo').settingName, $(this).val() + ($(this).data('fieldInfo').unit || ''));
                        return false;
                    });
                } else if (field.settingType === 'general') {
                    //bind change to color picker
                    thisInput.bind('change click', function () {
                        self.updateSettings($(this).data('fieldInfo').settingName, $(this).val());
                        self.updateSelectedElement($(this).data('fieldInfo').settingName, $(this).val());
                        return false;
                    });
                }
            }
        };
        // extend field with slider, color picker etc
        self.extendField = function (field, extendWith) {
            if (extendWith === 'slider') {
                var input = (function () {
                    var min = 1,
                        max = 100,
                        step = 1,
                        value = 40,
                        orientation = 'horizontal',
                        reverse = false,
                        $slider = $('<div>'),
                        input = field,
                        fieldset = input.closest('fieldset');
                    fieldset.addClass('slider-extended');
                    fieldset.append($slider);
                    if (input.data('fieldInfo').slider) {
                        min = parseFloat(input.data('fieldInfo').slider.min);
                        max = parseFloat(input.data('fieldInfo').slider.max);
                        step = parseFloat(input.data('fieldInfo').slider.step);
                        if (input.data('fieldInfo').slider.orientation) {
                            orientation = input.data('fieldInfo').slider.orientation;
                        }
                        if (input.data('fieldInfo').slider.value) {
                            value = input.data('fieldInfo').slider.value;
                        }
                        if (input.data('fieldInfo').slider.reverse) {
                            reverse = true;
                        }
                    }
                    //init slider
                    $slider.slider({
                        range: "min",
                        value: value,
                        min: min,
                        max: max,
                        step: step,
                        orientation: orientation,
                        slide: function (event, ui) {
                            if (!reverse) {
                                input.val(ui.value);
                            } else {
                                //reversed values
                                input.val(max + min - ui.value);
                            }
                            input.trigger('change');
                        }
                    });
                    //bind value change to the size slider
                    input.bind('change click', function () {
                        var val = $(this).val();
                        if (val) {
                            $slider.slider('value', parseFloat(val));
                        }
                        return false;
                    });
                    return input;
                }());
            } else if (extendWith === 'dropdown') {
                var input = (function () {
                    var $dropdown = $('<select><option></option></select>'),
                        input = field,
                        fieldset = input.parents('fieldset'),
                        key;
                    fieldset.addClass('dropdown-extended');
                    fieldset.find('label').append($dropdown);
                    for(key in input.data('fieldInfo').dropdown) {
                        var val = input.data('fieldInfo').dropdown[key];
                        $dropdown.append('<option value="' + key + '">' + val + '</option>');
                    }
                    $dropdown.bind('change', function () {
                        input.val($(this).val());
                        input.trigger('change');
                    });
                    //bind value change to the size slider
                    input.bind('change click', function () {
                        var val = $(this).val();
                        if (val) {
                            $dropdown.val(val);
                        }
                        return false;
                    });
                    return input;
                }());
            } else if (extendWith === 'colorPicker') {
                var input = (function () {
                    var input = field;
                    input.change(function () {
                        $(this).css('backgroundColor', $(this).val());
                    });
                    //init color picker
                    input.ColorPicker({
                        color: '#0000ff',
                        onShow: function (colpkr) {
                            $(colpkr).show();
                            return false;
                        },
                        onHide: function (colpkr) {
                            $(colpkr).hide();
                            return false;
                        },
                        onChange: function (hsb, hex, rgb) {
                            input.val('#' + hex);
                            input.trigger('change');
                            input.trigger('change').css('backgroundColor', '#' + hex);
                        },
                        onBeforeShow: function () {
                            $(this).ColorPickerSetColor(this.value);
                        }
                    }).bind('keyup', function () {
                        $(this).ColorPickerSetColor(this.value);
                    });
                    return input;
                }());
            } else if (extendWith === 'selectorPicker') {
                var input = (function (field) {
                    var replacementField,
                        thisInput,
                        selectorPicker,
                        selectorPicker2,
                        input = field,
                        field = field.data('fieldInfo'),
                        fieldset = input.parents('fieldset');
                    self.settingFields[field.name] = $('<fieldset id="selectorFieldset"><label><input type="' + field.type + '" name="' + field.name + '" title="' + field.settingName + '">CSS selecor editor (advanced)</label></fieldset>');
                    replacementField = self.settingFields[field.name];
                    thisInput = self.getField(field.name);
                    selectorPicker = $('<button class="pickElement">Pick element</button>');
                    selectorPicker2 = $('<button class="pickElement pickAddElement">Pick element(add)</button>');
                    self.$selectorPicker = selectorPicker;
                    self.$selectorPicker2 = selectorPicker2;
                    //
                    //setTimeout(function () {
                    self.$selectorPicker.insertBefore(self.settingFields.presets);
                    //}, 100);
                    //replacementField.prepend(selectorPicker);
                    replacementField.prepend(selectorPicker2);
                    selectorPicker.on('click', function () {
                        self.bindGetSelector();
                        return false;
                    });
                    selectorPicker2.on('click', function () {
                        self.bindGetSelector(true);
                        return false;
                    });
                    //replace default field
                    fieldset.replaceWith(replacementField);
                    replacementField.find('label').hide();
                    thisInput.data('fieldInfo', field);
                    //return replaced input
                    return thisInput;
                }(field));
            }
            return input;
        };
        // get field value
        self.getField = function (name) {
            var input = self.settingFields[name].find('input');
            return input;
        };
        // set field value
        self.setField = function (name, value) {
            var input = self.getField(name);
            input.val(value);
            input.trigger('change');
        };
        /*
         * EFFECTS
         */
        self.loadEffectsPanel = function (data) {
            var i,
                field,
                paramObj,
                dropdown,
                option,
                field,
                effectsList = $('<div class="effectsList">');
            // save effects to array
            self.effects = data;
            // Create effects modal
            var modalOptions = {
                id: 'effectsPanel',
                name: 'effects', // name conflict was here
                title: 'Effects',
                left: '50%',
                top: '50px',
                width: '190px'
            };
            var modal = self.createNewModal(modalOptions);
            dropdown = $('<select>');
            dropdown.append($('<option>Add new effect</option>'));
            // add options to the modal
            for (i = 0; i < data.length; i += 1) {
                field = data[i];
                option = $('<option value="' + field.settingName + '">' + field.label + '</option>');
                dropdown.append(option);
            }
            if (data.length < 3) {
                dropdown.append('<option value="upgrade">More options</option>');
            }
            // add dropdown to modal
            modal.append(dropdown);
            // change
            dropdown.change(function () {
                if ($(this).val() == 'upgrade') {
                    var link = $('<a href="http://fontsforweb.com/purchase/pluginupgradesubscribe?url=' + fontBlogUrl + '&name=' + fontBlogName + '" class="overlay_url" id="upgradeToProButton" data-upgrade="true">Pro settings</a>').appendTo('body');
                    link.click();
                    link.remove();
                    return;
                }
                self.addEffect($(this).val());
                dropdown.find('option').eq(0).attr('selected', 'selected');
            });
            modal.append(effectsList);
            effectsList.sortable({
                stop: function () {
                    // get new order of items
                    var items = effectsList.find('> div'),
                        newEffectsOrder = [];
                    // for each item
                    items.each(function (ind) {
                        var effectSettings = $(this).data('settings');
                        effectSettings.effectNo = ind;
                        newEffectsOrder.push(effectSettings);
                    });
                    self.currentPreset.effects = newEffectsOrder;
                    // refresh text shadow effects
                    self.updateTextShadowEffects(self.currentElement);
                }
            });
        };
        /*
         * Styles
         */
        self.loadStylesPanel = function (data) {
            var i,
                field,
                paramObj,
                $list,
                field,
                $li,
                $div;
            // save effects to array
            self.styles = data;
            // Create styles modal
            var modalOptions = {
                id: 'stylesPanel',
                name: 'styles', // name conflict was here
                title: 'Style presets',
                right: '0',
                top: '50px',
                width: '400px'
            };
            var modal = self.createNewModal(modalOptions);
            $list = $('<ul>');
            // add dropdown to modal
            modal.append($list);
            // add options to the modal
            for (i = 0; i < data.length; i += 1) {
                field = data[i];
                $div = $('<div>');
                $li = $('<li>').append($div)
                $list.append($li);

                $div.text(field.label);
                $div.attr('data-value', field.settingName);
                
                // create temporary preset
                self.createPreset(field.settingName, '[data-value="' + field.settingName + '"]');
                self.loadStylePreset(field.settingName);
                self.unhighlightCurrent();
                self.deletePreset(self.currentPresetNo, true);
            }
            if (data.length < 3) {
                var button = $('<button>More options</button>');
                $list.append(button);
                button.click(function () {
                    var link = $('<a href="http://fontsforweb.com/purchase/pluginupgradesubscribe?url=' + fontBlogUrl + '&name=' + fontBlogName + '" class="overlay_url" id="upgradeToProButton" data-upgrade="true">Pro settings</a>').appendTo('body');
                    link.click();
                    link.remove();
                    return;
                });
            }

            /*var button = $('<button>Show style</button>').appendTo(modal);
            button.click(function () {
                var i,
                    presetSettings = {};
                $.extend(true, presetSettings, self.currentPreset);
                delete presetSettings.name;
                delete presetSettings.selector;
                delete presetSettings.shadowEffects;
                delete presetSettings.styles["text-shadow"];
                for(i = 0; i < presetSettings.effects.length; i++) {
                    delete presetSettings.effects[i].calculated;
                }

                alert(JSON.stringify(presetSettings));
            });*/
            modal.append(button);
            // change
            $list.on('click', 'li', function () {
                var value = $(this).find('div').data('value');
                if (value === 'upgrade') {
                    var link = $('<a href="http://fontsforweb.com/purchase/pluginupgradesubscribe?url=' + fontBlogUrl + '&name=' + fontBlogName + '" class="overlay_url" id="upgradeToProButton" data-upgrade="true">Pro settings</a>').appendTo('body');
                    link.click();
                    link.remove();
                    return;
                } else if (!value) {
                    return;
                }
                self.loadStylePreset(value);
            });
        };
        /**
        * Load style from style presets
        **/
        self.loadStylePreset = function (settingName) {
            var stylePreset = self.getStyleDefinitionByName(settingName),
                presetSettings = stylePreset.presetSettings;
            
            self.unloadCurrentElementEffects();
            self.currentPreset.effects = [];

            self.populateStyles(presetSettings);
            
            $.extend(true, self.currentPreset, presetSettings);
            self.loadEffectSettings();
            self.applyFont();
            self.loadFontPreview();
        };
        /*
         * load effect settings
         */
        self.loadEffectSettings = function () {
            // if no effects loaded yet quit
            if (!self.effects) return;
            if (!self.currentPreset.effects) return;

            // get effect saved settings
            for (var i = 0; i < self.currentPreset.effects.length; i++) {
                var effect = self.currentPreset.effects[i],
                    // add effect in order to the effects list
                    $effectItem = self.createEffectEntry(effect);
                if (effect.enabled) {
                    $effectItem.find('input[name=enabled]').attr("checked", "true");
                }
                // go through all the parameters and set them accordingly
                // clone object beforehand to avoid properties overwriting inside effect
                var params = $.extend(true, {}, effect.params);
                for (var property in params) {
                    var value = params[property];
                    // get field from current effect
                    var found = $effectItem.find('input[title=' + property + ']');
                    if (found.length) {
                        found.val(value);
                        found.trigger('change');
                    }
                }
            }
        };
        /*
         * Unload current effect
         *
         * @returns {unresolved}
         */
        self.unloadCurrentElementEffects = function () {
            //console.log(self.effectSliders, self.currentPreset, self.currentPreset.effects);
            if (self.currentPreset === undefined || self.currentPreset.effects === undefined) return;
            if (self.effectSliders && Object.size(self.effectSliders)) {
                // unload all handles
                for (var i = 0; i < self.currentPreset.effects.length; i++) {
                    var effect = self.currentPreset.effects[i];
                    if (self.effectSliders[effect.uniqueId]) {
                        self.effectSliders[effect.uniqueId].hide();
                    }
                }
            }

            if (!self.modals['effects']) return;
            self.modals['effects'].find('.effectsList').html('');
        };
        /*
         * add effect to effects list
         */
        self.addEffect = function (settingName) {
            var effectSettings = {},
                loadDefaults = 1;
            if (!self.currentPreset.effects) {
                self.currentPreset.effects = [];
                effectSettings.effectNo = 0;
            } else {
                effectSettings.effectNo = self.currentPreset.effects.length;
            }
            effectSettings.settingName = settingName;
            effectSettings.uniqueId = effectSettings.effectNo + Math.round(Math.random() * 1000000000) + settingName;
            effectSettings.enabled = 1;
            // add effect settings to preset
            self.currentPreset.effects.splice(0, 0, effectSettings);
            // create entry
            return self.createEffectEntry(effectSettings, loadDefaults);
        };
        /*
         * add effect to the list
         *
         * @param {type} effectId
         * @returns {effect}
         */
        self.createEffectEntry = function (effectSettings, loadDefaults) {
            //if effects modal not created yet don't load effects
            if (!self.modals['effects']) return;
            var effectItem,
                effectDefinition = self.getEffectDefinitionByName(effectSettings.settingName),
                effectsModal = self.modals['effects'].find('.effectsList'),
                effectParams = $('<div class="params"></div>'),
                enabledCheckbox = $('<input type="checkbox" name="enabled">'),
                arrow = $('<a href="#" class="effectArrow"></a>'),
                label = $('<a href="#" class="effectName">' + effectDefinition.label + '</a>'),
                closeButton = $('<a href="#" class="removeEffect">x</a>');
            if (loadDefaults === undefined) {
                loadDefaults = 0;
            }
            // create item markup
            effectItem = $('<div>');
            effectItem.append('<div class="label">');
            effectItem.find('.label').append(arrow);
            effectItem.find('.label').append(enabledCheckbox);
            effectItem.find('.label').append(label);
            effectItem.find('.label').append(closeButton);
            effectItem.append(effectParams);
            effectParams.hide();
            if (effectSettings.enabled) {
                enabledCheckbox.attr('checked', 'true');
            }
            // add settings
            effectsModal.prepend(effectItem);
            var paramObj = [];
            paramObj.field = effectDefinition;
            paramObj.settings = effectSettings;
            paramObj.target = effectParams;
            paramObj.type = 'extrafields';
            
            // actions
            label.click(function (e) {
                if (effectParams.is(':visible')) {
                    arrow.animateRotate(0);
                } else {
                    arrow.animateRotate(90);
                }
                e.preventDefault();
                effectParams.slideToggle();
            });
            arrow.click(function (e) {
                if (effectParams.is(':visible')) {
                    arrow.animateRotate(0);
                } else {
                    arrow.animateRotate(90);
                }
                e.preventDefault();
                effectParams.slideToggle();
            });
            // close button
            closeButton.click(function (e) {
                e.preventDefault();
                // delete effect from 
                self.removeEffect(effectSettings.uniqueId, effectItem);
            });
            // enable disable checkbox
            enabledCheckbox.click(function (e) {
                if ($(this).is(':checked')) {
                    self.enableEffect(effectSettings.uniqueId, effectItem);
                } else {
                    self.disableEffect(effectSettings.uniqueId, effectItem);
                }
            });
            self.addSettingsField(paramObj, loadDefaults);
            //add item reference in settings and settings in item
            //effectSettings.el = effectItem; ERROR on stringify
            effectItem.data('settings', effectSettings);
            return effectItem;
        };
        /*
         * get effect definition by id
         */
        self.getEffectDefinitionByName = function (effectId) {
            if (!self.effects) return false;
            // go thorugh all effects and find the ONE
            for (var i = 0; i < self.effects.length; i++) {
                var effect = self.effects[i];
                if (effect.settingName === effectId) {
                    return effect;
                }
            }
            return false;
        };
        /*
         * get style
         */
        self.getStyleDefinitionByName = function (styleId) {
            if (!self.styles) return false;
            // go thorugh all effects and find the ONE
            for (var i = 0; i < self.styles.length; i++) {
                var style = self.styles[i];
                if (style.settingName === styleId) {
                    return style;
                }
            }
            return false;
        };
        /*
         * Enable effect
         *
         * @param {type} effectId
         */
        self.enableEffect = function (effectId, $effectItem) {
            if (!self.currentPreset.effects) return false;
            var effect = self.getElementsEffect(effectId);
            effect.enabled = 1;
            // if has handle show it
            if (self.effectSliders[effectId]) {
                self.effectSliders[effectId].show();
            }
            // update text shadow effects
            self.updateTextShadowEffects(self.currentElement);
        };
        /*
         * Disable effect
         *
         * @param {type} effectId
         */
        self.disableEffect = function (effectId, $effectItem) {
            if (!self.currentPreset.effects) return false;
            var effect = self.getElementsEffect(effectId);
            effect.enabled = 0;
            // delete shadow css
            self.removeShadowEffect(effectId);
            // if has handle hide it
            if (self.effectSliders[effectId]) {
                self.effectSliders[effectId].hide();
            }
        };
        /*
         * Delete effect from an element
         *
         * @param {type} effectId
         */
        self.removeEffect = function (effectId, $effectItem) {
            if (!confirm('Remove the effect?')) return;
            if (!self.currentPreset.effects) return false;
            // go thorugh all effects and find the ONE
            for (var i = 0; i < self.currentPreset.effects.length; i++) {
                var effect = self.currentPreset.effects[i];
                if (effect.uniqueId === effectId) {
                    self.currentPreset.effects.splice(i, 1);
                }
            }
            // delete shadow css
            self.removeShadowEffect(effectId);
            if (self.effectSliders[effectId]) {
                // remove handle
                self.effectSliders[effectId].remove();
            }
            // delete entry
            $effectItem.remove();
        };
        /*
         * Get effect of an element
         *
         * @param {type} effectId
         */
        self.getElementsEffect = function (effectId) {
            if (!self.currentPreset.effects) return false;
            // go thorugh all effects and find the ONE
            for (var i = 0; i < self.currentPreset.effects.length; i++) {
                var effect = self.currentPreset.effects[i];
                if (effect.uniqueId === effectId) {
                    return effect;
                }
            }
        };
        /*
        draw effects
        options.target;
        options.deg;
        options.distance;
        options.effectId;
        options.effectsList;
        */
        self.drawEffects = function (options) {
            if (!self.shadowSupport) return false;
            var depth = options.distance / 10,
                subjectColor = options.target.css('color'),
                color = options.color,
                subjectColorRgb = self.parseRgb(subjectColor),
                rColor = subjectColorRgb.r,
                gColor = subjectColorRgb.g,
                bColor = subjectColorRgb.b,
                i = 0,
                j = 0,
                speed = i,
                xDist = 0,
                yDist = 0,
                //get effect
                effect = self.getElementsEffect(options.effectId),
                angle = options.deg;
            if (color) {
                var colorRgb = self.html2rgb(color.replace('#', ''));
            } else {
                colorRgb = subjectColorRgb;
            }
            // set default angle
            if (angle === undefined) {
                angle = 290;
            }
            // reset current elements calculated effect value
            effect.calculated = '';
            // go through effects which should be applied
            for (i = 0; i < options.effectsList.length; i++) {
                depth = options.distance / 10;
                var effectName = options.effectsList[i];
                switch (effectName) {
                case 'textShadow':
                    effect.calculated += options.completeValue;
                    //console.log(effect.calculated);
                    //completeValue += ' ' + $(this).val() + unit;
                    //effect.calculated = completeValue.replace(/, +$/,'')
                    break;
                case 'stroke':
                    var spread = 2;
                    if (options.spread) {
                        spread = options.spread;
                    }
                    // if distance is bigger than 4 add
                    if (options.distance > 4) {
                        // slash
                        effect.calculated += options.distance + 'px ' + options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += -options.distance + 'px ' + options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += options.distance + 'px ' + -options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += -options.distance + 'px ' + -options.distance + 'px ' + spread + 'px ' + color + ', ';
                        // top and down
                        effect.calculated += options.distance + 'px 0px ' + spread + 'px ' + color + ', ';
                        effect.calculated += -options.distance + 'px 0px ' + spread + 'px ' + color + ', ';
                        effect.calculated += '0px ' + options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += '0px ' + -options.distance + 'px ' + spread + 'px ' + color + ', ';
                    } else {
                        // only slash
                        effect.calculated += options.distance + 'px ' + options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += -options.distance + 'px ' + options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += options.distance + 'px ' + -options.distance + 'px ' + spread + 'px ' + color + ', ';
                        effect.calculated += -options.distance + 'px ' + -options.distance + 'px ' + spread + 'px ' + color + ', ';
                    }
                case 'extrude3d':
                    // get color color
                    rColor = colorRgb.r;
                    gColor = colorRgb.g;
                    bColor = colorRgb.b;
                    //initially take 20% off
                    rColor = rColor / 100 * 80,
                    gColor = gColor / 100 * 80,
                    bColor = bColor / 100 * 80;
                    //loop to depth
                    for (j = 0; j < depth; j++) {
                        //calculate x and y of next shadow
                        speed = 1.2;
                        xDist += speed * Math.sin(angle * Math.PI / 180);
                        yDist += speed * -Math.cos(angle * Math.PI / 180);
                        xDist = xDist;
                        yDist = yDist;
                        //percentage darkened
                        var percentageDone = j / depth;
                        //darkening strength - the bigger depth the lower sstrength
                        var light = 10 - percentageDone * 10;
                        //darken the next shadow a bit take 10%
                        rColor = Math.floor(rColor / 100 * 91 + light);
                        gColor = Math.floor(gColor / 100 * 91 + light);
                        bColor = Math.floor(bColor / 100 * 91 + light);
                        color = 'rgb(' + rColor + ', ' + gColor + ', ' + bColor + ')';
                        //put together shadow setting
                        effect.calculated += xDist.toFixed(2) + 'px ' + yDist.toFixed(2) + 'px ' + 0.3 + 'px ' + color + ', ';
                    }
                    break;
                case 'shadow3d': //generate text shadow value
                    // get color color
                    rColor = colorRgb.r;
                    gColor = colorRgb.g;
                    bColor = colorRgb.b;
                    //loop to depth
                    for (j = 0; j < depth; j++) {
                        if (j > 3 && i % 3) continue;
                        //calculate x and y of next shadow
                        speed = 6;
                        xDist += speed * Math.sin(angle * Math.PI / 180);
                        yDist += speed * -Math.cos(angle * Math.PI / 180);
                        xDist = xDist;
                        yDist = yDist;
                        //lighten the next shadow a bit take 10%
                        rColor = Math.floor(rColor / 90 * 100);
                        gColor = Math.floor(gColor / 90 * 100);
                        bColor = Math.floor(bColor / 90 * 100);
                        var opacity = options.opacity;
                        if (!opacity) opacity = 0.3;
                        color = 'rgba(' + rColor + ', ' + gColor + ', ' + bColor + ', ' + opacity + ')';
                        //put together shadow setting
                        effect.calculated += xDist.toFixed(2) + 'px ' + yDist.toFixed(2) + 'px ' + ((j + 1) * 2) + 'px ' + color + ', ';
                    }
                    break;
                }
            }
            // filter result
            effect.calculated = effect.calculated.replace(/, +$/, '');
            //apply text shadow
            self.updateTextShadowEffects(options.target);
        };
        /*
         * Remove shadow effect
         *
         * @param {type} subject
         */
        self.removeShadowEffect = function (effectId) {
            // delete from shadow effects
            delete self.currentPreset.shadowEffects[effectId];
            // update shadow effects on given element
            self.updateTextShadowEffects(self.currentElement);
        };
        //update effects
        self.updateTextShadowEffects = function (subject) {
            var allShadows = '';
            // go through all currently applied 
            for (var i = 0; i < self.currentPreset.effects.length; i++) {
                var effect = self.currentPreset.effects[i];
                if (effect.calculated && effect.enabled) {
                    if (allShadows) allShadows += ', ';
                    allShadows += effect.calculated;
                }
            }
            if (allShadows === '') {
                allShadows = 'none';
            }
            //get all different text shadows
            //subject[0].style.textShadow = allShadows + ' !important';
            subject.each(function () {
                $(this).style('textShadow', allShadows, 'important');
            });
            self.updateCssSettings('text-shadow', allShadows);
        };
        /*
         *
         * PRESETS MANAGEMENT
         *
         */
        /*
         *
         * Create a new preset - selection
         *
         */
        self.createPreset = function (presetName, selector) {
            var property,
                newPreset,
                newPresetId;
            if (selector === undefined || !selector) {
                selector = 'PICK AN ELEMENT NOW - or type CSS selector(advanced)';
            }
            //get first preset as a template
            newPreset = {};
            //set preset variables
            newPreset.name = presetName;
            newPreset.selector = selector;
            newPreset.fontid = '';
            newPreset.fontName = '';
            newPreset.effects = [];
            // !!! when styles are array they are not visible for PHP?
            newPreset.styles = {};
            //reset css styles
            for (property in newPreset.styles) {
                newPreset.styles[property] = '';
            }
            //push the preset at the end
            newPresetId = self.options.presets.push(newPreset) - 1;
            //add preset to the dropdown and select it
            self.$presetsDropdown.append('<option value="' + newPresetId + '">' + presetName + '</option>');
            //get preset id and load it
            self.loadPreset(newPresetId);
        };
        //add new preset
        self.renamePreset = function () {
            //current preset option
            var currPresetOption = self.$presetsDropdown.find('option[value=' + self.currentPresetNo + ']'),
                presetName = prompt('New preset name i.e. paragraph', currPresetOption.text()),
                property;
            if (!presetName) {
                return;
            }
            self.$presetsDropdown.find('option[value=' + self.currentPresetNo + ']').text(presetName);
            self.currentPreset.name = presetName;
        };
        //delete preset
        self.deletePreset = function (presetNo, silent) {
            if(silent === undefined) {
                if (!confirm("Are you sure you want to delete this preset?")) {
                    return false;
                }
            }
            if (self.options.presets.length === 1) {
                alert('At least one preset has to be present');
                return;
            }
            if(silent === undefined) {
                self.unhighlightCurrent();
            }
            self.options.presets.splice(presetNo, 1);
            self.$presetsDropdown.find('option[value=' + presetNo + ']').remove();
            // delete all presets
            self.$presetsDropdown.html('');
            // recreate presets menu to number values from 0
            for (var i = 0; i < self.options.presets.length; i += 1) {
                var preset = self.options.presets[i],
                    presetName = self.options.presets[i].name,
                    presetId = i;
                // unwire all outlined elements
                if (preset.selector.indexOf('ELEMENT NOW') === -1 && preset.selector.indexOf('PICK ELEMENT') === -1) {
                    $(preset.selector).data('wired', false);
                }
                self.$presetsDropdown.append('<option value="' + presetId + '">' + presetName + '</option>');
            }
            if(silent === undefined) {
                self.outlineAllPresets();
                alert('When resetting settings or deleting preset you have to save to see the change');
                self.loadPreset(0);
            } else if (self.options.presets && self.options.presets[1]) {
                self.loadPreset(1);
            } else {
                self.loadPreset(0);
            }
        };
        //delete current preset
        self.deleteCurrentPreset = function () {
            self.deletePreset(self.currentPresetNo);
        };
        /*
         * Reload currently loaded preset
         */
        self.reloadPreset = function () {
            self.loadPreset(self.currentPresetNo);
        };
        /*
         * load preset - load selection with all param values
         *
         * @param {type} presetNo
         * @returns {unresolved}
         */
        self.loadPreset = function (presetNo) {
            var preset;
            presetNo = parseInt(presetNo, 10);
            var preset = self.options.presets[presetNo];

            self.unloadPreset();
            if (!preset) {
                return;
            }
            if (self.mode === 'postPage') return;
            // if this is preset 0 hide appearance panel
            if (presetNo === 0) {
                self.$apr.hide();
            } else {
                self.$apr.show();
            }
            // if only one preset exists hide appearance panel
            if (self.options.presets.length == 1) {
                self.settingFields.presets.hide();
                self.$selectorPicker2.hide();
            } else {
                self.settingFields.presets.show();
                self.$selectorPicker2.show();
            }
            // unload effects
            self.unloadCurrentElementEffects();
            self.currentPresetNo = presetNo;
            self.currentPreset = preset;
            // if current selector is invalid current element is false
            if (self.currentPreset.selector.indexOf('ELEMENT NOW') !== -1 || self.currentPreset.selector.indexOf('PICK ELEMENT') !== -1) {
                self.currentElement = false;
            } else {
                // otherwise get current element
                self.currentElement = $(self.currentPreset.selector);
            }
            // add space for shadow effects
            self.currentPreset.shadowEffects = [];
            //select preset from dropdown
            self.$presetsDropdown.val(presetNo);
            self.populateStyles(preset);
            self.highlightCurrent();
            //load effects
            self.loadEffectSettings();
            self.loadFontPreview();
        };
        self.populateStyles = function (preset) {
            var property,
                found;
            /*
            populate general fields
            */
            for (property in preset) {
                found = $('body').find('input[title=' + property + ']');
                if (found.length) {
                    found.val(preset[property]);
                    found.trigger('change');
                }
            }
            /*
            populate css fields
            */
            for (property in preset.styles) {
                found = $('body').find('input[title=' + property + ']');
                if (found.length) {
                    found.val(preset.styles[property]);
                    found.trigger('change');
                }
            }
        };
        self.unloadPreset = function () {
            var $field,
                $input,
                $dropdown,
                key;
            // go through all fields
            for (key in self.settingFields) {
                $dropdown = [];
                $field = self.settingFields[key];
                if (!$field || !($field instanceof $)) {
                    continue;
                }
                $input = $field.find('input');
                $input.val('');
                //$input.trigger('change');
                $dropdown = $field.find('select');
                if ($dropdown.length) {
                    $dropdown.val('');
                    $input.hide();
                }
            }
        };
        self.loadFontPreview = function () {
            var preset = self.currentPreset,
                imageUrl = '',
                originalBg = $('#fontfaceSettings').data('originalBackground');
            if (preset['fontid'] && preset['fontName']) {
                if (!originalBg) {
                    $('#fontfaceSettings').data('originalBackground', $('#fontfaceSettings').css('backgroundImage'));
                }
                imageUrl = self.options.FFW_baseUrl + '/public/fonts/' + preset['fontid'] + '/' + preset['fontName'] + '.png';
                $('#fontfaceSettings').css({'backgroundImage': 'url(' + imageUrl + ')'});
            } else if (originalBg) {
                $('#fontfaceSettings').css({'backgroundImage': $('#fontfaceSettings').data('originalBackground')});
            }
        }
        /**
         *
         *  FONTS BROWSER
         *
         */
        /*
        Create HTML markup
        */
        self.createFontPanel = function () {
            var i;
            var iframe = '<iframe style="width:98%; height:200px; border:none; margin: 10px 1%" frameBorder="0" src="http://fontsforweb.com/user/pluginactivate?apikey=' + self.options.apikey + '&blogurl=' + fontBlogUrl + '"></iframe>';
            
            //create html within font browser
            self.$el.show();
            self.$el.append($('<h1 class="draggableModalBar"><a class="closeModal" href="#">x</a></h1>'));
            self.$el.append('<div class="tablinks"><a class="tablink" href="fontslist">Fontsforweb.com</a><a class="tablink" href="uploaded">Upload</a><a class="tablink" href="pro">PRO settings</a></div>');
            self.$el.append('<div class="tab" id="fontslist"></div>');
            self.$el.append('<div class="tab" id="uploaded"><div class="loading"></div></div>');
            self.$el.append('<div class="tab" id="pro">' + iframe + '</div>');
            
            self.$el.find('.tab').hide();
            self.$el.find('.tab').eq(0).show();
            self.$el.find('.tablink').on('click', function (e) {
                var target,
                    tab;
                e.preventDefault();
                self.$el.find('.tab').hide();
                target = $(this).attr('href');
                tab = self.$el.find('#' + target).show();
                if (target === 'uploaded') {
                    self.loadPrivateFonts();
                }
                return false;
            });
            self.$el.css('left', '0')
                .draggable({
                    handle: self.$el.find('.draggableModalBar')
                });
            $('body').on('mousedown', '.draggableModal', function () {
                self.modalToTop(this);
            });
            self.$el.find('a.closeModal').on('click', function () {
                self.$el.hide();
                return false;
            });
        };
        /*
         * Show fonts browser
         */
        self.showFontsBrowser = function () {
            if (!this.fontInitialized) {
                self.createFontPanel();
                self.loadFontCategories();
                this.fontInitialized = true;
            } else {
                self.$el.toggle();
            }
            self.modalToTop(self.$el);
        };
        /*
         *  Init fonts browser carousel
         */
        self.initCarousel = function () {
            var carousel = self.$el.find('#FFW_browser_carousel').fcarousel({
                buttonNextHTML: '<a href="#" onclick="return false;"></a>',
                buttonPrevHTML: '<a href="#" onclick="return false;"></a>',
                animation: 1000,
                scroll: 2
            });
        };
        /*
         *  Load font categories
         */
        self.loadFontCategories = function () {
            //make ajax request to get categories
            self.xhrPost({
                    url: self.options.FFW_baseUrl + '/fontcategories/fontplugininit',
                    data: {
                        apikey: self.options.apikey,
                        blogurl: fontBlogUrl,
                        ver: self.version
                    },
                    format: 'html'
                },
                function (data) {
                    //if empty answer display error
                    if (!data || data === '') {
                        self.$el.html('<h1>An error has occurde</h1><p>Please try again later</p>');
                    }
                    //hide loader
                    self.$el.find('#loading').remove();
                    //show fonts list
                    self.$el.find('#fontslist').html(data);
                    //bind close to close button
                    self.$el.find('a.close_link').on('click', function () {
                        self.$el.toggle();
                    });
                    //init carousel
                    self.initCarousel();
                });
        };
        /*
         * bind onclick to links to reveal subcategories
         */
        self.bindShowCategoriesAction = function () {
            $('body').on('click', self.baseSelector + ' #categoriesList > ul li a.categoryChoose', function () {
                var categoryId = $(this).attr('name');
                //hide all subcategories of other parents
                self.$el.find('#subcategoriesList li').hide();
                self.$el.find('#subcategoriesList li.instructions').show();
                //show all subcategories of this parent
                self.$el.find('#subcategoriesList li#FFW_parentcategory_' + categoryId).show();
                self.$el.find('.fcarousel-next').click();
                return false;
            });
        };
        //bind onclick to reveal font of category
        self.bindShowFontsAction = function () {
            //bind onclick subcategories to load their fonts
            $('body').on('click', self.baseSelector + ' #subcategoriesList > ul li a.categoryChoose', function () {
                var categoryId = $(this).attr('name');
                self.xhrPost({
                        url: self.options.FFW_baseUrl + '/fontcategories/wpfontsforwebcategoryfonts/catid/' + categoryId,
                        data: {
                            apikey: self.options.apikey,
                            blogurl: fontBlogUrl
                        },
                        format: 'html'
                    },
                    function (data) {
                        //if empty answer display error
                        if (!data || data === '') {
                            self.$el.html('<h1>An error has occurde</h1><p>Please reload page and try again later</p>');
                        }
                        //apply content to div
                        self.$el.find('#fontList').html(data);
                        //move carousel right
                        self.$el.find('.fcarousel-next').click();
                    });
                return false;
            });
            //bind delete function
            $('body').on('click', self.baseSelector + ' #uploaded a.delete', function () {
                if (!confirm("Are you sure you want to delete this font?")) {
                    return false;
                }
                var fontId = $(this).attr('name');
                self.xhrPost({
                    url: self.options.FFW_baseUrl + '/api',
                    data: {
                        action: 'deletefont',
                        apikey: self.options.apikey,
                        blogurl: fontBlogUrl,
                        fontid: fontId
                    }
                }, function (data) {
                    if (data.success === 'true') {
                        self.loadPrivateFonts();
                    } else {
                        alert('Font deleting error.');
                        $('.fontUploadForm').show();
                        $('.fontUploading').hide();
                    }
                });
                return false;
            });
        };
        /*
         * when clicked on font in fonts browser
         */
        self.setFontOnclick = function () {
            var selector;
            //bind onclick font change action to font images
            $('body').on('click', self.baseSelector + ' #fontList a.font_pick, ' + self.baseSelector + ' .fontsList a.font_pick', function () {
                var element,
                    fontName = $(this).parent().attr('title'),
                    selector;
                //PAGE POST version
                if (self.mode === 'postPage') { //it's single post editing page
                    //set font to id from name attribute of a
                    self.setTinyMCEFont($(this).attr('name'), fontName);
                    return false;
                } else { //GENERAL VERSION
                    //get selector
                    selector = self.currentPreset.selector;
                    //exit when default selector
                    if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                        return;
                    }
                    //set form fields
                    self.currentPreset.fontid = $(this).attr('name');
                    self.currentPreset.fontName = fontName;
                    //get target element from iframe or current page
                    if ($("#header1preview").length) {
                        element = $("#header1preview").contents().find();
                        self.applyFont(element);
                    } else {
                        self.applyFont();
                    }
                    self.loadFontPreview();
                    return false;
                }
            });
        };
        /**
        *   apply font to selection
        **/
        self.applyFont = function (frame) {
            //get selector
            var element,
                elements,
                fontName = self.currentPreset.fontName,
                selector = self.currentPreset.selector,
                head,
                linkElement;

            if(frame === undefined) {
                element = $(document);
                head = document.getElementsByTagName('head')[0];
            } else {
                element = frame;
                head = element[0].getElementsByTagName('head')[0];
            }

            linkElement = $(document.createElement('link'));
            //get and add stylesheet
            linkElement.attr({
                href: self.options.FFW_baseUrl + '/font/generatepreviewcss/?id=' + self.currentPreset.fontid,
                rel: 'stylesheet',
                type: 'text/css'
            });
            linkElement.appendTo(head);
            //set font family to a selector
            elements = element.find(selector);
            elements.each(function () {
                $(this).style("font-family", fontName, 'important');
            });
        }
        /* 
         * Load uploaded fonts
         *
         */
        self.loadPrivateFonts = function () {
            var apikey = self.options.apikey || false;
            //load private fonts
            self.xhrPost({
                url: self.options.FFW_baseUrl + '/font/getuserfonts',
                data: {
                    apikey: apikey,
                    blogurl: fontBlogUrl,
                    blogname: fontBlogName
                },
                format: 'html'
            }, function (data) {
                self.$el.find('#uploaded').html(data);
            });
        };
        /*
         * Initialize font upload form
         */
        self.initUploadForm = function () {
            $('body').on('submit', self.baseSelector + ' #fontUpload', function () {
                self.ajaxFontUpload.start();
            });
        };
        /* 
         * Upload font using ajax
         *
         */
        self.ajaxFontUpload = (function () {
            return {
                start: function () {
                    $('.fontUploadForm').hide();
                    $('.fontUploading').show();
                    $('#fontUploadIframe').load(function () {
                        self.loadPrivateFonts();
                        //get info about the upload
                        /*$.getJSON(self.options.FFW_baseUrl + '/font/wpaddsummary', function (data) {
                        if (data.success === 'true') {
                        self.loadPrivateFonts();
                        } else {
                        alert('Font upload error. Check if file is not blocked against embedding.');
                        $('.fontUploadForm').show();
                        $('.fontUploading').hide();
                        }
                        });*/
                    });
                }
            };
        }());
        /*
         *
         * ELEMENT SELECTION AND CSS RULE GENERATION
         *
         */
        /* 
         * Enter element selection mode
         *
         * @param {type} add
         * @returns {unresolved}
         */
        self.bindGetSelector = function (add) {
            //get selector
            var selector = self.currentPreset.selector;
            //add cancel button
            if (!self.$cancelSelecting) {
                self.$cancelSelecting = $('<a href="#" class="cancelSelecting">Stop selecting</a>');
                $('body').append(self.$cancelSelecting);
                self.$cancelSelecting.data('cancelSelecting', true);
                //hide other elements
                self.$presets.hide();
            } else {
                self.$cancelSelecting.show();
                //hide other elements
                self.$presets.hide();
            }
            $('a, button').on('click.selectionMode', function (e) {
                e.preventDefault();
                self.handleSelectionClick($(this), add);
                return false;
            });
            $('body').on('click.selectionMode', '*', function (e) {
                e.preventDefault();
                self.handleSelectionClick($(this), add);
                return false;
            });
            $('body').on('mouseover', '*', function () {
                if ($(this).data('cancelSelecting')) {
                    return;
                }
                self.hoverSelector = self.getSelector(this);
                self.hoverHighlightCurrent();
                $(this).css('outline', '3px dashed rgba(50,50,250,0.7)');
                (function () {
                    var element = $(this);
                    setTimeout(function () {
                        element.css('outline', 'none');
                    }, 100);
                }());
                return false;
            });
            $('body').on('mouseout', '*', function () {
                $(this).css('outline', 'none');
                return false;
            });
        };
        /*
        * Enter selection mode
        *
        */
        self.handleSelectionClick = function ($el, add) {
            //if this is cancel selecting button
            if ($el.hasClass('cancelSelecting')) {
                self.stopSelectionMode();
                self.reloadPreset();
                return;
            }
            //if the element's preset is already created just pick it up
            if ($el.data('wired')) {
                self.$cancelSelecting.css('outline', 'none');
                self.stopSelectionMode();
                self.loadPreset($el.data('presetNo'));
                return false;
            }
            var sel = self.getSelector($el[0]),
                selectorInput,
                comma;
            //return false;
            //if not add to current preset mode
            if (!add) {
                self.stopSelectionMode();
                var val = prompt('Name the selection i.e. title, header or paragraph. It\'ll be now listed in the upper left corner.');
                //if not ask for new selection name
                if (!val) {
                    self.bindGetSelector(add);
                    return false;
                } else {
                    //create a new preset of given selector
                    self.createPreset(val, sel);
                }
            }
            self.outlineAllPresets();
            selectorInput = self.getField('selector');
            if (add) {
                comma = selectorInput.val() ? ', ' : '';
                selectorInput.val(selectorInput.val() + comma + sel);
            } else {
                selectorInput.val(sel);
            }
            selectorInput.trigger('change');
            self.stopSelectionMode();
            self.highlightCurrent();
            //load preset again to apply changes to a new element
            if (add) {
                self.reloadPreset();
            }
        };
        /* 
         * Exit element selection mode
         *
         * @param {type} htmlcol
         * @returns {rgb}
         */
        self.stopSelectionMode = function () {
            $('body').off('mouseover', '*');
            $('body').off('click.selectionMode', '*');
            $('a').off('.selectionMode');
            $('button').off('.selectionMode');
            $(this).css('outline', 'none');
            $('body').off('mouseout', '*');
            self.$cancelSelecting.hide();
            //hide other elements
            self.$presets.show();
        };
        /* 
         * Generate CSS selector for passed element
         *
         * @param {type} element
         * @returns {selector}
         */
        self.getSelector = function (element) {
            var selector = $(element).parents()
                .map(function () {
                    return this.tagName;
                })
                .get().reverse().join(" "),
                id,
                classNames,
                selectorsArr,
                sel,
                parents = [],
                selectors = [];
            //go through each mapped object and get id class etc
            for (var i = 0;
                (i < $(element).parents().length && i < 4); i++) {
                var $parent = $(element).parents().eq(i),
                    parentSelector = $parent[0].nodeName;
                //classses only for first 3 parents(now it's reversed)
                if (i < 2) {
                    //get id
                    //if (id = $parent.attr('id')) {
                    //    parentSelector += '#' + id;
                    //}
                    //class names
                    classNames = $parent.attr("class");
                    if (classNames) {
                        parentSelector += "." + $.trim(classNames).replace(/\s/gi, ".");
                    }
                }
                selectors.push(parentSelector);
            }
            selector = selectors.reverse().join(' ');
            //get element tagname
            if (selector) {
                selector += " " + $(element)[0].nodeName;
            }
            id = $(element).attr("id");
            if (id) {
                selector += "#" + id;
            }
            classNames = $(element).attr("class");
            if (classNames) {
                selector += "." + $.trim(classNames).replace(/\s/gi, ".");
                // remove ui-draggable when re-selecting element with once removed draggability
                //ui-draggable
            }
            return selector;
        };
        /* 
         * Scroll to selected element
         *
         * @returns {unresolved}
         */
        self.scrollToSelection = function () {
            var selector = self.currentPreset.selector,
                container,
                found;
            container = $('body');
            //exit when default selector
            if (selector.indexOf('ELEMENT NOW') !== -1 || selector.indexOf('PICK ELEMENT') !== -1) {
                return;
            }
            //get by selector from the iframe
            found = container.find(selector);
            //scroll to the top when no el selected
            if (!found.length) {
                return;
            }
            //animate scroll
            $('html, body').animate({
                scrollTop: (parseInt(found.offset().top, 10) - 150)
            }, 'slow');
        };
        /*
         * Highlight current element on hover
         */
        self.hoverHighlightCurrent = function () {
            var selector = self.hoverSelector;
            if (self.tempHightlighted) {
                self.tempHightlighted.css('outline', 'none');
            }
            //exit when default selector
            if (selector.indexOf('ELEMENT NOW') !== -1 || selector.indexOf('PICK ELEMENT') !== -1) {
                return;
            }
            self.tempHightlighted = $(selector);
            self.tempHightlighted.css('outline', '3px dashed rgba(100,250,100,0.7)');
        };
        /*
         * highlight all elements(with edititng option)
         */
        self.outlineAllPresets = function () {
            //go through all presets
            for (var i = 0; i < self.options.presets.length; i++) {
                if (parseInt(i, 10) === parseInt(self.currentPresetNo, 10)) continue;
                var preset = self.options.presets[i];
                var selector = preset.selector;
                //exit when default selector
                if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                    continue;
                }
                var litme = $(selector);
                litme.css('outline', '2px dashed rgba(150,150,250,0.3)');
                $('.deletePreset').remove();
                litme.css("cursor", 'pointer', 'important');
                if (litme.data('wired') === true) {
                    continue;
                }
                litme.data('wired', true);
                (function () {
                    var ind = i;
                    litme.data('presetNo', ind);
                    litme.click(function (e) {
                        // onbeoforeunload helps here
                        //e.preventDefault();
                        if (parseInt($(this).data('presetNo'), 10) !== parseInt(self.currentPresetNo, 10)) {
                            e.preventDefault();
                            self.loadPreset(ind);
                        }
                    });
                    litme.hover(
                        function () {
                            if (parseInt($(this).data('presetNo'), 10) !== parseInt(self.currentPresetNo, 10)) {
                                $(this).css('outline', '2px dashed rgba(150,150,250,0.9)');
                            }
                        },
                        function () {
                            if (parseInt($(this).data('presetNo'), 10) !== parseInt(self.currentPresetNo, 10)) {
                                $(this).css('outline', '2px dashed rgba(150,150,250,0.3)');
                            }
                        }
                    );
                }());
            }
        };
        /* 
         * highlight current
         * @returns {unresolved}
         */
        self.highlightCurrent = function () {
            var selector = self.currentPreset.selector,
                btn;
            self.outlineAllPresets();
            //exit when default selector
            if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                return;
            }
            self.hightlighted = $(selector);
            self.hightlighted.css('outline', '3px dashed rgba(250,50,30,0.7)');
            self.hightlighted.style("cursor", 'move', 'important');
            if(!self.hightlighted.find('.deletePreset')[0]) {
                btn = $('<button class="deletePreset">X</button>')
                self.hightlighted.append(btn);
                btn.click(function (e) {
                    e.preventDefault();
                    self.deleteCurrentPreset();
                    return false;
                });
            }
            self.makeCurrentDraggable();
        };
        /*
         * Removes highlighting from current element
         *
         * @returns {unresolved}
         */
        self.unhighlightCurrent = function () {
            var selector = self.currentPreset.selector;
            self.outlineAllPresets();
            //exit when default selector
            if (selector.indexOf('ELEMENT NOW') != -1 || selector.indexOf('PICK ELEMENT') != -1) {
                return;
            }
            self.hightlighted = $(selector);
            self.hightlighted.css('outline', 'none');
            self.hightlighted.style("cursor", '');
            //self.removeCurrentDraggable();
            // remove draggable
            self.hightlighted.draggable("destroy");
        };
        /* 
         * make current element draggable
         */
        self.makeCurrentDraggable = function () {
            var isMozilla = $.browser && $.browser.mozilla;
            self.hightlighted.draggable({
                drag: function (event, ui) {
                    var top = ui.position.top,
                        left = ui.position.left,
                        $el = self.hightlighted;
                    $el.each(function () {
                        //set position to relative
                        $(this).style("position", 'relative', 'important');
                        //set slider y to dragged value (parseInt(top,10) + parseInt($(window).scrollTop(),10))
                        //for firefox only
                        if (isMozilla) {
                            self.updateCssSettings('top', (parseInt(top, 10) + parseInt($(window).scrollTop(), 10)) + 'px');
                        } else {
                            self.updateCssSettings('top', top + 'px');
                        }
                        //set slider x to dragged value
                        self.updateCssSettings('left', left + 'px');
                        //set position to relative
                        self.updateCssSettings('position', 'relative');
                    });
                    //waiting to set top and left to "!important" after jquery ui draggable
                    setTimeout(function () {
                        $el.each(function () {
                            //for firefox only
                            if (isMozilla) {
                                $(this).style("top", (parseInt(top, 10) + parseInt($(window).scrollTop(), 10)) + 'px', 'important');
                            } else {
                                $(this).style("top", top + 'px', 'important');
                            }
                            //set slider x to dragged value
                            $(this).style("left", left + 'px', 'important');
                        });
                    }, 10);
                }
            });
        };
        /**
         *
         * COLOR CONVERSION FUNCTIONS
         *
         */
        /* 
         * Convert from HEX/HTML to rgb object
         *
         * @param {type} htmlcol
         * @returns {rgb}
         */
        self.html2rgb = function (htmlcol) {
            var rgb = new Object();
            rgb.r = self.html2dec(htmlcol.substr(0, 2));
            rgb.g = self.html2dec(htmlcol.substr(2, 2));
            rgb.b = self.html2dec(htmlcol.substr(4, 2));
            return rgb;
        };
        /*
         * Parse RGB to HTML to
         * @param {type} rgbString
         * @returns {@exp;self@call;html2rgb}
         */
        self.parseRgb = function (rgbString) {
            return self.html2rgb(self.rgbString2hex(rgbString));
        };
        self.rgbString2hex = function (rgbString) {
            var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            // parts now should be ["rgb(0, 70, 255", "0", "70", "255"]
            if (!parts) return '000000';
            delete(parts[0]);
            for (var i = 1; i <= 3; ++i) {
                parts[i] = parseInt(parts[i]).toString(16);
                if (parts[i].length == 1) parts[i] = '0' + parts[i];
            }
            var hexString = parts.join('');
            return hexString;
        };
        /*
         * Converts color from HEX/HTML-style (00-FF) to decimal color value (0-255)
         */
        self.html2dec = function (h) {
            return parseInt(h, 16);
        };
        /*
         *
         * MODAL WINDOWS AND OVERLAYS
         *
         */
        /*
         * Create new modal window
         */
        self.createNewModal = function (options) {
            var modal = $('<div class="draggableModal"><h1 class="draggableModalBar">' + options.title + '<a class="closeModal" href="#">x</a></h1></div>');
            modal.css({
                left: options.left ? options.left : 'auto',
                right: options.right ? options.right : 'auto',
                top: options.top,
                width: options.width,
                position: 'fixed',
                zIndex: 1000000
            });
            if (options.nobar) {
                modal.find('h1.draggableModalBar').hide();
            }
            if (!options.show) {
                modal.hide();
            }
            if (options.id) {
                modal.attr('id', options.id);
            }
            self.modals[options.name] = modal;

            //make draggable
            modal.draggable({
                handle: modal.find('.draggableModalBar'),
                start: function () {
                    $(this).css('bottom', 'auto');
                }
            });

            modal.find('.closeModal').click(function () {
                modal.hide();
                return;
            });
            modal.appendTo($('body'));
            //self.modalToTop(modal);
            return modal;
        };
        /* 
         * create a popup with content for overlay links
         *
         * @returns {unresolved}
         */
        self.bindLinkOverlay = function () {
            $('body').on('click', 'a.font_url, a.overlay_url, button.overlay_url', function () {
                var modal,
                    frameSrc,
                    iframe,
                    overlay,
                    href = $(this).attr('href');
                if ($(this).attr('data-upgrade') === 'true') {
                    self.setupApikeyCheckingInterval();
                }
                //create overlay
                overlay = $('<div id="memberOverlay"></div>');
                overlay.appendTo(document.body);
                overlay.css({
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    'background-color': '#333',
                    filter: 'alpha(opacity=50)',
                    '-moz-opacity': 0.5,
                    '-khtml-opacity': 0.5,
                    opacity: 0.5,
                    'z-index': 200000001
                });
                modal = $('<div class="draggableModal ui-draggable"><h1 class="draggableModalBar">' + href + ' <a class="closeModal" href="#">x</a></h1></div>');
                modal.css({
                    position: 'fixed',
                    left: '-475px',
                    marginLeft: '50%',
                    width: '950px',
                    top: '40px',
                    zIndex: 200000001
                });
                modal.find('.closeModal').bind('mousedown', function () {
                    modal.remove();
                    overlay.remove();
                    return;
                });
                frameSrc = href;
                iframe = $('<iframe style="width:98%; height:490px; border:none; margin: 10px 1%" frameBorder="0" src="' + frameSrc + '"></iframe>');
                iframe.appendTo(modal);
                modal.appendTo($('body')).show();
                overlay.click(function () {
                    modal.remove();
                    $(this).remove();
                });
                return false;
            });
            return;
        };
        /*
         * adapt plugin looks to different modes - global or post page
         */
        self.adaptOptionsToMode = function () {
            if (self.mode === 'postPage') {
                self.settingFields.presets.hide();
                self.$presets.hide();
                self.$apr.show();
                self.settingFields.selector.hide();
                $('#fontSaveSettings').hide();
                $('#effectsButton').hide();
            }
        };
        /*
         * Show hide modal
         *
         * @param {type} modalName
         */
        self.toggleModal = function (modalName) {
            if (self.modals[modalName] === undefined) {
                return;
            }
            // if this is effects button
            if (modalName === 'effects') {
                // detect CSS text-shadow support in JavaScript
                if (document.createElement("detect").style.textShadow !== "") {
                    alert('Sorry, but your browser does not support advanced effects. Please upgrade to Chrome, Firefox or Internet Explorer 10');
                    return;
                }
            }
            self.modals[modalName].toggle();
            self.modalToTop(self.modals[modalName]);
        };
        /*
         * Put modal on top
         *
         * @param {type} selectedModal
         */
        self.modalToTop = function (selectedModal) {
            var highestZindex = 1000000;
            for (var index in self.modals) {
                var modal = self.modals[index],
                    modalZindex = modal.css('zIndex');
                if (parseInt(modalZindex, 10) > parseInt(highestZindex, 10)) {
                    highestZindex = modalZindex;
                }
            }
            $(selectedModal).css({
                'zIndex': parseInt(highestZindex, 10) + 1
            });
        };
        /*
         *
         *  TINY MCE EDITOR
         *
         */
        /*
         *    set font for post or page in tinymce
         */
        self.setTinyMCEFont = function (fontId, fontName) {
            //get selection
            var selection = tinyMCE.activeEditor.selection.getContent(),
                selectorValid,
                $selectorContents,
                fontClass,
                node,
                newSpan,
                newHTML,
                inserted,
                $tempDiv,
                multipleSelectors;
            //only apply if something is selected
            if (!selection) {
                return;
            }
            //get node
            fontClass = "fontplugin_fontid_" + fontId + "_" + fontName;
            node = tinyMCE.activeEditor.selection.getNode();
            //selectorValid - validate selector created from selected text. 
            //required because for example "." with nothing following breaks function execution
            selectorValid = true;
            try {
                $selectorContents = $(selection);
            } catch (e) {
                selectorValid = false;
            }
            if (selectorValid && $selectorContents.length > 1) {
                selectorValid = false;
                multipleSelectors = true;
            }
            if (selectorValid && ($.trim($(node).html()) === $.trim(selection) || $.trim($(node).html()) === $.trim($(selection).html()))) {
                //console.log('already isolated');
                tinyMCE.activeEditor.dom.setAttrib(node, 'class', fontClass);
            } else if (multipleSelectors) {
                $selectorContents.each(function () {
                    $(this).removePrefixedClasses('fontplugin_fontid_');
                    $(this).addClass(fontClass);
                    
                    $(this).attr('class').split(' ');
                });
                $tempDiv = $('<div>').append($selectorContents);
                newHTML = $tempDiv.html();
            
                inserted = tinyMCE.activeEditor.selection.setContent(newHTML);
            } else {
                newSpan = $("<span class=\"" + fontClass + "\">" + selection + '</span>');
                //get span html together with span itself
                newHTML = $('<div>').append(newSpan.clone()).html();
                //add font in use
                inserted = tinyMCE.activeEditor.selection.setContent(newHTML);
                tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('span.' + fontClass)[0]);
            }
            //loads font face to iframe editor
            self.loadFontFace(fontId);
        };
        /*
         * Load font to tinymce iframe
         */
        self.loadFontFace = function (fontId) {
            var head = self.postIframe[0].getElementsByTagName('head')[0],
                linkElement = $(document.createElement('link'));
            linkElement.attr({
                href: self.options.FFW_baseUrl + '/font/generatepreviewcss/?id=' + fontId,
                rel: 'stylesheet',
                type: 'text/css'
            });
            linkElement.appendTo(head);
        };
        /*
         *
         * UTILITY FUNCTIONS
         *
         */
        /*
         * execute cross domain request, JSON response
         *
         * @param {type} params
         * @param {type} callback
         * @returns {@exp;$@call;post}
         */
        self.xhrPost = function (params, callback) {
            var data = params;
            if (params.format === undefined) {
                params.format = 'json';
            }
            data.action = 'cross_domain_request';
            
            return $.ajax({
                type: "POST",
                url: ajaxproxy,
                data: data,
                success: function (response) {
                    if (typeof callback === 'function') {
                        callback(response);
                    }
                },
                dataType: params.format,
                error: function (xhr, textStatus, errorThrown) {
                    alert("An error occurde. This might be a conflict with another plugin. Error message: " + textStatus);
                }
            });
        };
        /*
         * show loading spinner
         */
        self.showLoading = function () {
            if ($('.fontLoading').length) {
                //self.$apr.find('fieldset').hide();
                //self.$el.find('> div').hide();
                $('.fontLoading').show();
                $('.fontLoading').show();
            } else {
                $('body').append('<div class="fontLoading"></div>');
            }
        };
        /*
         * hide loading spinner
         */
        self.hideLoading = function () {
            $('.fontLoading').hide();
            $('.fontLoading').hide();
        };
        /*
         * detect if we're on post editing page or on any other page
         */
        self.detectMode = function () {
            var iframe = $('#content_ifr');
            if (iframe.length) {
                self.mode = 'postPage';
                self.postIframe = iframe.contents();
                //self.tinyMCE = $(self.postIframe).find('#tinymce');
            } else {
                self.mode = 'global';
            }
            // detect CSS text-shadow support in JavaScript
            if (document.createElement("detect").style.textShadow === "") {
                self.shadowSupport = true;
            } else {
                self.shadowSupport = false;
            }
        };
        // finally INIT
        self.init();
    };
    /*
     * set default options
     */
    $.fontPlugin.defaultOptions = {
        FFW_baseUrl: 'http://fontsforweb.com'
    };
    /*
     * make jquery plugin
     */
    $.fn.fontPlugin = function (options) {
        return this.each(function () {
            var fontPlugin = new $.fontPlugin(this, options);
        });
    };
    /*
     * HANDLE PLUGIN
     *
     * options
     * startX -vstarting position
     * startY -vstarting position
     * name - handle name
     * label - visible label
     *
     */
    var XYSlider = function (el, options) {
        var self = this;
        self.$el = $(el);
        self.$el.data('XYSlider', self);
        // immediate init funciton
        self.init = function () {
            // get handle element by name
            var handleHolder = self.$el.data(options.settingName),
                handle = (handleHolder && handleHolder[0]) ? handleHolder.find('.XYSlider') : false;
            // if doesn't exist create the handle
            if (!handleHolder || !handleHolder[0]) {
                handleHolder = $('<div class="XYSliderHolder"></div>');
                handle = $('<div class="XYSlider">' + options.label + '</div>');
                handleHolder.append(handle);
                self.$el.append(handleHolder);
            }
            self.$el.data(options.settingName, handleHolder);
            // save in object
            self.$handleHolder = handleHolder;
            self.$handle = handle;
            // make handle draggable
            handle.each(function () {
                // show handle
                $(this).parent().show();
                // make draggable
                $(this).draggable({
                    drag: function (event, ui) {
                        var top = ui.position.top,
                            left = ui.position.left,
                            // revert top: more is higher
                            y = -top,
                            x = options.invertX ? -left : left;
                        self.commitDrag(x, y, true);
                    }
                });
            });
        };
        /*
         * Change position of draggable
         *
         * x - x position
         * y - y position
         */
        self.setPosition = function (x, y) {
            var handle = self.$handle;
            
            if (x !== false) {
                self.x = x;
            } else if (self.x === undefined) {
                x = 0;
                self.x = 0;
            } else {
                x = self.x;
            }
            if (y !== false) {
                y = y;
                self.y = y;
            } else if (self.y === undefined) {
                y = 0;
                self.y = 0;
            } else {
                y = self.y;
            }
            if (x === false && y === false) {
                return;
            }
            // move x and y - revert top: more is higher
            handle.css({
                'top': -y + 'px',
                'left': (options.invertX ? -x : x) + 'px'
            });
            // commit drag
            self.commitDrag(x, y, true);
        };
        /*
         * Execute callbacks
         */
        self.commitDrag = function (x, y, stop) {
            var rad = Math.atan2(x, y),
                deg = rad * (180 / Math.PI),
                distance = 0;
            if (stop === undefined) {
                stop = false;
            }
            //get angle
            if (deg < 0) {
                deg = 360 + deg;
            }
            // round angle to full degrees
            deg = Math.round(deg);
            // calculate distance
            distance = Math.sqrt(x * x + y * y);
            // set current values
            self.setCurrentValues(x, y, deg, distance);
            // call actions
            options.actions.call(this, x, y, deg, distance);
        };
        self.setCurrentValues = function (x, y, deg, distance) {
            self.x = x;
            self.y = y;
            self.deg = deg;
            self.distance = distance;
            return self;
        };
        self.getCurrentValues = function () {
            return {
                'x': self.x,
                'y': self.y,
                'deg': self.deg,
                'distance': self.distance
            };
        };
        self.init();
    };
    // use prototype
    $.fn.XYSlider = function (options) {
        return this.each(function () {
            //new XYSlider(this, options);
            //var pluginName = 'XYSlider';
            new XYSlider(this, options);
        });
    };
}(fQuery));