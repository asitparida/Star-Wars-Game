(function () {

    /* FEATURES IMPLEMENTED 
     *
     * LOADING CIRCULAR OBJECTS ON PAGE/APP LOAD
     * ANIMATING CIRCULAR OBJECTS ONTO THE STAGE           
     * RANDOMIZING OBJECT POSITION WHEN CREATED
     * DESTORYING OBJECTS WHEN ON SCREEN
     * EPHEMERAL VIEWING OF OBJECT ID WHEN DESTOYED/COLLAPSED
     * ANIMATING SIZE OF ALL STARS THROUGH SLIDER
     * VARIATION IN TARNSITION GAPS TRHOUGH SLIDER
     * TOGGLING BETWEEN THEMEATIC PAINT AND UNIQUE STYLE ATTRIBUTES
     * THEMATIC STYLING OF OBJECTS
     * SETTINGS PANEL CONTROL
     * DATA HISTORY/LOG CONTROL
     * VIEWING ALL OBJECTS CREATED
     * VIEWING ALL OBJECTS DESTROYED
     * VIEWING ALL OBJECTS ACTIVE
     * DESTOYONG ACTIVE OBEJCTS FROM THE LIST VIEW
     * 
     */

    /// <summary>REPLACE ALL INSTNACES USING REGEX</summary>
    String.prototype.replaceAll = function (find, replaceWith) {
        var regex = new RegExp(find, 'g');
        return this.replace(regex, replaceWith);
    }

    /// <summary>GENERATE GUID LIKE STRING UISNG MATH PROPERTIES</summary>
    function _GUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
        }
        return s4() + s4() + "_" + s4();
    }

    /// <summary>GENERATE GUID LIKE STRING UISNG MATH PROPERTIES</summary>
    function _STAR_WARS_DS_GUID() {
        var _qualifiers = ['PALPA', 'VADER'];
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
        }
        return "_" + _qualifiers[Math.floor(Math.random() * _qualifiers.length)] + '_' + s4();
    }


    /// <summary> POLYFILL FOR ARRAY - FILTER</summary>
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun/*, thisArg*/) {
            'use strict';
            if (this === void 0 || this === null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }
            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];
                    if (fun.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }
            return res;
        };
    }

    /// <summary>POLYFILL FALLBACK FOR WINDOW REQUESTANIMATIONFRAME</summary>
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (/* function */ callback, /* DOMElement */ element) {
              window.setTimeout(callback, 1000 / 60);
          };
    })();

    /// <summary>TIMER TO KEEP TRACK OF TRANSITION GAPS</summary>
    var _sliderTimer = 5000;

    /// <summary>DEATHSTAR PROTOTYPE</summary>
    function DeathStar() {
        this.id = _STAR_WARS_DS_GUID();
        this.createdOn = Date.now();
        this.destroyedOn = null;
        this.active = false;
        this.instance = null;
        this.timeoutanim = null;
    }

    /// <summary>TO ANIMATE THE LEFT & TOP MOVEMENT OF TE DEATH STARS</summary>
    DeathStar.prototype.animateStarPositioning = function () {
        var self = this;
        if (self.active) {
            self.timeoutanim = setTimeout(function () {
                window.requestAnimFrame(function () {
                    var props = document.getElementById('deathStarsContainer').getBoundingClientRect();
                    self.translateY = (Math.random() * (props.height - 200));
                    self.translateX = (Math.random() * (props.width - 200));
                    self.instance.style.transform = 'translate(' + self.translateX + 'px, ' + self.translateY + 'px)';
                });
                self.animateStarPositioning();
            }, Math.random() * _sliderTimer);
        }
    }

    /// <summary>MAIN CONTROLLER PROTOTYPE</summary>
    function MainController($timeout, $mdToast, $compile, $scope) {
        var self = this;
        self.timeout = $timeout;
        self.mdToast = $mdToast;
        self.compile = $compile;
        self.scope = $scope;
        self.showColorPicker = false;
        self.settingsPaneColorsInitalized = false;
        self.containerProps = document.getElementById('deathStarsContainer').getBoundingClientRect();
        self.colorModes = [
            { id: 'col0', colorId: "turquoise", name: "turquoise", code: "#1abc9c" },
            { id: 'col1', colorId: "emerland", name: "emerland", code: "#2ecc71" },
            { id: 'col2', colorId: "nephritis", name: "nephritis", code: "#27ae60" },
            { id: 'col3', colorId: "peterRiver", name: "peter river", code: "#3498db" },
            { id: 'col4', colorId: "spaceClassic", name: "space classic", code: "#e8e8e8" },
            { id: 'col5', colorId: "amethyst", name: "amethyst", code: "#9b59b6" },
            { id: 'col6', colorId: "carrot", name: "carrot", code: "#e67e22" },
            { id: 'col7', colorId: "alizarin", name: "alizarin", code: "#e74c3c" },
            { id: 'col8', colorId: "pomegranate", name: "pomegranate", code: "#c0392b" }
        ];
        self.activeColorMode = self.colorModes[4];
        self.stars = [];
        self.zIndex = 10;
        self.showPanel = false;
        self.showAppPanel = false;
        self.showActive = false;
        self.showAppSettings = false;
        self.showAppData = false;
        self.sliderTimer = 4000;
        self.sliderTimerMin = 1000;
        self.sliderTimerMax = 10000;
        self.size = 80;
        self.randomChrome = false;
        self.showHelpPanel = false;

        self.timeout(function () {
            document.getElementById('mainStartPlayBtn').classList.add('show');
        }, 2000);

        /// <summary> AUDIO OBJECT TO PLAY THE LAUNCH STAR WARS MUSIC</summary>
        self.myAudio = new Audio('https://archive.org/download/StarWarsThemeSongByJohnWilliams/Star%20Wars%20Theme%20Song%20By%20John%20Williams.mp3');
        if (self.myAudio) {
            self.myAudio.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
            }, false);
            self.myAudio.play();
        }

        /// <summary>AUDIO OBJECT TO PLAY THE BLAST SOUND WHEN DESTROYING A STAR</summary>
        self.blastSound = new Audio('bomb.mp3');

    }

    /// <summary>(UN)/RANDOMIZING THE CHROMES FOR THE DEATH STARS</summary>
    MainController.prototype.randomizeChrome = function () {
        var self = this;
        if (self.randomChrome) {
            angular.forEach(self.stars, function (star) {
                star.instance.classList.add('colorFix');
                var _color = self.colorModes[Math.floor(Math.random() * self.colorModes.length)];
                star.instance.setAttribute("color", _color.colorId);
            });
        }
        else {
            angular.forEach(self.stars, function (star) {
                star.instance.classList.remove('colorFix');
                star.instance.removeAttribute("color");
            });
        }
    }

    /// <summary>UPDATING THE SCOPE GLOBAL TIMER FOR TRANISTION GAP</summary>
    MainController.prototype.sliderTimerChange = function () {
        var self = this;
        _sliderTimer = self.sliderTimer;
    }

    /// <summary>STARTING THE GAME PLAY BY COLLPASING THE PANELS AND INTIALIZING THE STAR PAINTS</summary>
    MainController.prototype.startPlay = function () {
        var self = this;
        self.showPanel = true;
        self.timeout(function () {
            self.showAppPanel = true;
            self.initializeStars();
            var vol = 1, interval = 200;
            if (self.myAudio) {
                var intervalID = setInterval(function () {
                    if (vol > 0) {
                        vol -= 0.05;
                        self.myAudio.volume = vol.toFixed(2);
                    } else {
                        clearInterval(intervalID);
                    }
                }, interval);
            }
            self.showHelpPanel = true;
        }, 1000);
    }

    /// <summary>OPENING THE THEMATIC COLOR PICKER</summary>
    MainController.prototype.openColorPicker = function () {
        var self = this;
        if (self.showColorPicker == false) {
            self.showColorPicker = true;
            self.settingsPaneColorsInitalized = true;
            self.shownColorModes = [];
            self.timeout(function () {
                angular.forEach(self.colorModes, function (cm, iter) {
                    self.shownColorModes.push(cm);
                    cm.transition = 'all ' + (50 + (150 * (iter + 1))) + 'ms' + ' ease-out';
                });
                angular.forEach(self.colorModes, function (cm, iter) {
                    self.timeout(function () {
                        var _elem = document.getElementById('color_' + cm.colorId);
                        _elem.style.transform = 'rotate(' + (-150 + (iter * 18)) + 'deg)';
                    }, 400);
                });
            }, 400);
        }
        else {
            self.showColorPicker = false;
            self.timeout(function () {
                self.settingsPaneColorsInitalized = false;
                self.shownColorModes = [];
            }, 300);
        }
    }

    /// <summary>CLOSSING THE THEMATIC COLOR PICKER</summary>
    MainController.prototype.closeColorPicker = function () {
        var self = this;
        self.showColorPicker = false;
        self.timeout(function () {
            self.settingsPaneColorsInitalized = false;
            self.shownColorModes = [];
        }, 300);
    }

    /// <summary>CALLBACK WHEN A COLOR IS CHOSEN FROM THE THEMATIC COLOR PICKER</summary>
    MainController.prototype.choseColor = function (color) {
        var self = this;
        self.activeColorMode = color;
    }

    /// <summary>OPENING THE APP DATA PANEL</summary>
    MainController.prototype.openAppDataPanel = function () {
        var self = this;
        self.showAppPanel = false;
        self.timeout(function () {
            self.showAppData = true;
        }, 500);
    }

    /// <summary>OPENING THE APP SETTINGS PANEL</summary>
    MainController.prototype.openAppSettingsPanel = function () {
        var self = this;
        self.showAppPanel = false;
        self.timeout(function () {
            self.showAppSettings = true;
            self.openColorPicker();
        }, 500);
    }

    /// <summary>CLOSING THE APP DATA PANEL</summary>
    MainController.prototype.closeAppDataPanel = function () {
        var self = this;
        self.showAppData = false;
        self.timeout(function () {
            self.showAppPanel = true;
        }, 100);
    }

    /// <summary>CLOSING THE APP SETTINGS PANEL</summary>
    MainController.prototype.closeAppSettingsPanel = function () {
        var self = this;
        self.showAppSettings = false;
        self.closeColorPicker();
        self.timeout(function () {
            self.showAppPanel = true;
        }, 100);
    }

    /// <summary>INITIALIZING DOM PAINT OF THE FIRST 10 STARS</summary>
    MainController.prototype.initializeStars = function () {
        var self = this;
        if (!self.initialized) {
            self.containerProps = document.getElementById('deathStarsContainer').getBoundingClientRect();
            while (self.stars.length < 10) {
                self.drawStar();
            }
            self.initialized = true;
        }
    }

    /// <summary>CALLBACK WHEN A STAR IS SELECTED TO BE DESTORYED</summary>
    MainController.prototype.destroyStar = function (id) {
        var self = this;
        angular.forEach(self.stars, function (_el) {
            if (_el.id === id) {
                _el.instance.style.left = _el.translateX + 'px';
                _el.instance.style.top = _el.translateY + 'px';
                _el.instance.classList.add('destroy');
                _el.active = false;
                _el.destroyedOn = Date.now();
                clearTimeout(_el.timeoutanim);
                if (self.blastSound)
                    self.blastSound.play();
                self.timeout(function () {
                    angular.element(_el.instance).remove();
                    var idNotifier = document.getElementById('destroyedIdHolder');
                    angular.element(idNotifier).text('Death Star #' + id + ' destroyed!');
                    idNotifier.classList.add('show');
                    self.timeout(function () {
                        idNotifier.classList.remove('show');
                    }, 1000);
                }, 500);
                if (self.blastSound) {
                    self.timeout(function () {
                        self.blastSound.pause();
                        self.blastSound.currentTime = 0;
                    }, 1000);
                }
            }
        });
    }

    /// <summary>ADDING A SIGULAR STAR</summary>
    MainController.prototype.addStar = function () {
        var self = this;
        self.drawStar(500);
    }

    /// <summary>ACTIVATING A STAR, IKNVOKING ANIMATION AFTER PAINT COMPLETE</summary>
    MainController.prototype.activateStar = function (_newStar , ms) {
        var self = this;
        var _container = angular.element(document.getElementById('deathStarsContainer'));
        var _starTmpl = '<div class="death-star" id="UNIQ_STAR_ID"><div class="death-star-bg"></div><div class="death-star-mark" tabindex="-1" ng-click="main.destroyStar(\'UNIQ_STAR_ID\')"><div class="death-star-mark-bg"></div></div><div class="death-star-mark-shell" ng-click="main.destroyStar(\'UNIQ_STAR_ID\')"></div></div>';
        _starTmpl = _starTmpl.replaceAll('UNIQ_STAR_ID', _newStar.id);
        _container.append(_starTmpl);
        _newStar.instance = document.getElementById(_newStar.id);
        if (_newStar.instance) {
            self.compile(angular.element(_newStar.instance).contents())(self.scope);
            _newStar.translateY = (Math.random() * (self.containerProps.height - 200));
            _newStar.translateX = (Math.random() * (self.containerProps.width - 200));
            _newStar.instance.style.transform = 'translate(' + + _newStar.translateX + 'px, ' + _newStar.translateY + 'px)';
            angular.element(_newStar.instance).find('.death-star-mark').mouseenter(function (e) {
                $(e.target).closest('.death-star').addClass('hovered');
            }).mouseleave(function (e) {
                $(e.target).closest('.death-star').removeClass('hovered');
            });
        }
        _newStar.active = true;
        self.stars.push(_newStar);
        self.timeout(function () {
            _newStar.instance.classList.add('show');
            _newStar.instance.classList.add('show-anim');
            _newStar.instance.style.zIndex = self.zIndex++;
            $(_newStar.instance).find('.death-star-bg').addClass('active');
            $(_newStar.instance).find('.death-star-mark').addClass('active');
            setTimeout(function () {
                _newStar.instance.classList.remove('show-anim');
                _newStar.instance.classList.add('move-anim');
            }, 500);
            _newStar.animateStarPositioning();
        }, Math.random() * ms);
    }

    /// <summary>DARWING A NEW STAR</summary>
    MainController.prototype.drawStar = function (ms) {
        var self = this;
        var _newStar = new DeathStar();
        if (!ms)
            ms = 4000;
        self.activateStar(_newStar, ms);
    }

    MainController.prototype.getDestroyedCount = function () {
        var self = this;
        var _tempCollection = self.stars.filter(function (st) { return st.active == false });
        return _tempCollection ? _tempCollection.length : 0;
    }

    MainController.prototype.getActiveCount = function () {
        var self = this;
        var _tempCollection = self.stars.filter(function (st) { return st.active == true });
        return _tempCollection ? _tempCollection.length : 0;
    }

    /// <summary>APP MODULE INITIALIZATION & CONTROLLER INSTANCE REFERENCE</summary>
    angular.module('TopGit.UI', ['ngAnimate', 'ngMaterial'])
   .controller('TopGit.UI.MainController', ['$timeout', '$mdToast', '$compile', '$scope', MainController]);

})()