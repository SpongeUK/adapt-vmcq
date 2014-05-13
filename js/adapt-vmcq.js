define(function(require) {
    var mep = require("components/adapt-contrib-media/js/mediaelement-and-player.min.js");
    var Mcq = require('components/adapt-contrib-mcq/js/adapt-contrib-mcq');
    var Adapt = require('coreJS/adapt');
    
    var Vmcq = Mcq.extend({

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

            this.mediaElement = this.$('audio, video').mediaelementplayer({
                pluginPath:'assets/',
                success: _.bind(function (mediaElement, domObject) {
                }, this),
                features: ['playpause','progress','current','duration']
            });
        },

        forceChangeEvent: function(event) {
            $("#" + $(event.currentTarget).closest("label").attr("for")).change();
        }
    });

    Adapt.register("vmcq", Vmcq);

    return Vmcq;
});