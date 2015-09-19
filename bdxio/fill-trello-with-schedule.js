/**
 * To work properly, this snippet requires this snippet to be executed first :
 * https://github.com/fcamblor/chrome-snippets/blob/master/bootstrap/require-std-libs.js
 *
 * The snippet provides you with different utility function to fill a trello board with cfp talk schedule
 * It will fill different "lists" depending on talk types. You can define these lists by defining your own `cardComposers` below when passing it
 * to the fillTrelloWith() exported function.
 * 
 * Usage :
 * Call window.utls.fillTrelloWith({ ... Put here cfp schedule raw data ... })
 *
 * Also, please note that to nicely display tags in trello, you will need this useful chrome extension :
 * https://chrome.google.com/webstore/detail/card-color-titles-for-tre/hpmobkglehhleflhaefmfajhbdnjmgim
 */

if(!window.$){ throw "Missing jquery"; }
if(!window._){ throw "Missing lodash"; }
if(!window.Q){ throw "Missing Q"; }

window.utls = {};
(function(exported){
    var DEFAULT_CARD_COMPOSER = {
        "Hand's on Labs":{index:0, typeColor:"sky"},
        "Conference":{index:1, typeColor:"lime"},
        "Lightning talk":{index:2, typeColor:"pink"},
        "default":{index:3, typeColor:"yellow"}
    };

    function wait(duration) {
        var defer = Q.defer();
        setTimeout(function(){ defer.resolve(); }, duration);
        return defer.promise;
    }

    function selectLabel($card, label, color) {
        $card.find(".js-open-quick-card-editor").click();
        return wait(100).then(function(){
            $(".quick-card-editor-buttons-item-text:contains('Modifier les étiquettes')").click();
            return wait(100);
        }).then(function(){
            var $talkTypeLabel = $('.js-select-label:contains("'+label+'")');
            if($talkTypeLabel.length) {
                $talkTypeLabel.click();
                return wait(100);
            } else {
                $('.js-label-search').val(label);
                return wait(100).then(function(){
                    $(".js-add-label").click();
                    return wait(100);
                }).then(function(){
                    $(".js-palette-color.card-label-"+color).click();
                    $(".js-submit").click();
                    return wait(100);
                });
            }
        }).then(function(){
            $(".pop-over-header-close-btn").click();
            return wait(100);
        }).then(function(){
            $(".js-save-edits").click();        
            return wait(100);
        });
    }

    function createTalkCard(talk, cardComposer) {
        var $list = $($(".js-list-content")[cardComposer.index]);

        $list.find(".js-open-card-composer").click();
        return wait(100).then(function(){
            $list.find(".js-card-title").val("["+talk.id+"] "+talk.title);
            return wait(100);
        }).then(function(){
            $list.find(".js-add-card").click();
            return wait(100);
        }).then(function(){
            var $cards = $list.find(".js-member-droppable");
            var $latestCard = $($cards[$cards.length-1]);
            return selectLabel($latestCard, talk.talkType, cardComposer.typeColor).then(function(){
                return _.reduce(talk.speakers, function(previousPromise, speaker){
                    return previousPromise.then(function(){
                        return selectLabel($latestCard, speaker.name, "purple");
                    });
                }, Q.resolve());
            });
        }).then(function(){
            $(".js-close-window").click();
            wait(100);
        });
    }

    function fillTrelloWith(data, cardComposers) {
        cardComposers = cardComposers || DEFAULT_CARD_COMPOSER;
        var uniqueTalkTypes = _(data.slots).filter(function(slot){ return slot.talk; }).pluck("talk.talkType").unique().value();
        console.log(uniqueTalkTypes);

        _.reduce(data.slots, function(previousPromise, slot, index) {
            return previousPromise.then(function(){
                console.log("Processing slot "+index+"/"+data.slots.length+"...");
                if(!slot.talk){
                    return Q.resolve();
                }

                var cardComposer = (cardComposers[slot.talk.talkType] || cardComposers['default']);
                return createTalkCard(slot.talk, cardComposer);
            });
        }, Q.resolve());
    }

    _.extend(exported, {
        fillTrelloWith: fillTrelloWith,
        createTalkCard: createTalkCard
    });
    
})(window.utls);

