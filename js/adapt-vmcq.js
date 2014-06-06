define(function(require) {
    var mep = require("components/adapt-contrib-media/js/mediaelement-and-player.min.js");
    var Mcq = require('components/adapt-contrib-mcq/js/adapt-contrib-mcq');
    var Adapt = require('coreJS/adapt');

    var Vmcq = Mcq.extend({

        initialize: function () {
            Mcq.prototype.initialize.apply(this, arguments);
        },

        events: function() {
            var events = {
                'focus .vmcq-item input':'onItemFocus',
                'blur .vmcq-item input':'onItemBlur',
                'change .vmcq-item input':'onItemSelected',
                "click .vmcq-widget .button.submit": "onSubmitClicked",
                "click .vmcq-widget .button.reset": "onResetClicked",
                "click .vmcq-widget .button.model": "onModelAnswerClicked",
                "click .vmcq-widget .button.user": "onUserAnswerClicked"
            };
            if ($('html').hasClass('ie8')) {
                var ie8Events = {
                    'click label img':'forceChangeEvent'
                };
                events = _.extend(events, ie8Events);
            }
            return events;
            
        },

        canReset: function() {
            return !this.$('.vmcq-widget, .button.reset').hasClass('disabled');
        },

        resetItems: function() {
            this.$('.vmcq-item label').removeClass('selected');
            this.$('input').prop('checked', false);
            this.deselectAllItems();
            this.setAllItemsEnabled(true);
        },

        onItemSelected: function(event) {
            var selectedItemObject = this.model.get('_items')[$(event.currentTarget).parent('.vmcq-item').index()];
            
            if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
                this.toggleItemSelected(selectedItemObject, event);
            }
        },

        preRender: function() {
            Mcq.prototype.preRender.apply(this);
        },

        postRender: function() {
            Mcq.prototype.postRender.apply(this);

            var view = this;
            this.mediaElement = this.$('audio, video').mediaelementplayer({
                pluginPath:'assets/',
                enableAutosize: false,
                success: function (mediaElement, domObject) {
                    mediaElement.addEventListener('ended', function(event) {
                        var $item = $(event.target).closest('.vmcq-item');
                        view.markItemAsWatched($item.index(), $item);
                    }, false);
                },
                features: ['playpause','progress','current','duration']
            });

            if(this.requiresNoInteraction()) {
                this.model.set('_isComplete', true);
            }

        },

        forceChangeEvent: function(event) {
            $("#" + $(event.currentTarget).closest("label").attr("for")).change();
        },

        isWatched: function (item) {
            return item._isWatched === true;
        },

        requiresNoInteraction: function () {
            var items = this.model.get('_items');

            return _.every(items, function (item) {
                return item._shouldBeWatched === false && item._shouldBeSelecteded === false;
            });
        },

        markItemAsWatched: function (index, domObject) {
            var items = this.model.get('_items');
            if(index < 0 || index > items.length) return;

            var item = items[index];
            if(item) {
                item._isWatched = true;
                $(domObject).addClass('watched');
            }

            var requiredItems = _(items).where({ _shouldBeWatched: true });
            if(requiredItems.every(this.isWatched)) {
                if(this.getConfigSetting('_completeOnWatched')) {
                    this.model.set('_isComplete', true);
                }
                this.model.set('_isWatched', true);
                this.$el.addClass('watched');
            }
        },

        getConfigSetting: function (property, defaultValue) {
            if(typeof this.model.get(property) === 'undefined') {
                if(typeof Adapt.config.get('_vmcq')[property] === 'undefined') {
                    return defaultValue;
                } else {
                    return Adapt.config.get('_vmcq')[property];
                }
            } else {
                return this.model.get(property);
            }
        }
    });

    Adapt.register("vmcq", Vmcq);

    return Vmcq;
});