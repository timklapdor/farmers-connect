/**
 * Plugin: RichTile
 *
 * Because I got a little ambitious and decided to include ARIA attributes
 * and stuff, it became easier to manage this as a plugin.
 */

var RichTile = function (element, options) {
  this.element = $(element);
  this.options = $.extend({}, RichTile.DEFAULTS, options);
  this.flyoutElement = this.element.find(this.options.flyout);
  this.toggleElement = this.element.find(this.options.toggle);
  
  this.toggleElement.on({
    'click.RichTile': $.proxy(this.clickHandler, this),
    'keyup.RichTile': $.proxy(this.keyHandler, this)
  });
};

RichTile.DATA_KEY = 'plugin_richTile';

RichTile.DEFAULTS = {
  flyout: '.js-tile-flyout',
  toggle: '.js-toggle-tile',
  expandedClass: 'is-expanded',
  disabledClass: 'is-disabled',
  toggleKeyCodes: [13, 32] // ENTER, SPACE
};

RichTile.prototype.isExpanded = function() {
  return this.element.hasClass(this.options.expandedClass);
};

RichTile.prototype.isDisabled = function() {
  return this.element.hasClass(this.options.disabledClass);
};

RichTile.prototype.isEnabled = function() {
  return ! this.isDisabled();
};

RichTile.prototype.toggle = function(expand) {
  if (typeof expand === 'undefined') {
    expand = ! this.isExpanded();
  }
  if (this.isEnabled() || !expand) {
    this.flyoutElement.attr('aria-hidden', ! expand);
    this.toggleElement.attr('aria-expanded', expand);
    this.element.toggleClass(this.options.expandedClass, expand);
    this.element.trigger((expand ? 'expanded' : 'collapsed') + '.RichTile', [ this ]);
  }
  return this;
};

RichTile.prototype.expand = function() {
  return this.toggle(true);
};

RichTile.prototype.collapse = function() {
  return this.toggle(false);
};

RichTile.prototype.toggleEnable = function(enable) {
  if (typeof enable === 'undefined') {
    enable = this.isDisabled();
  }
  this.toggleElement.filter('[tabindex]').attr({
    'tabindex': enable ? 0 : -1,
    'aria-disabled': ! enable
  });
  if (! enable) {
    this.toggle(false);
  }
  this.element.toggleClass(this.options.disabledClass, ! enable);
  this.element.trigger((enable ? 'enabled' : 'disabled') + '.RichTile', [ this ]);
  return this;
};

RichTile.prototype.enable = function() {
  return this.toggleEnable(true);
};

RichTile.prototype.disable = function() {
  return this.toggleEnable(false);
};

RichTile.prototype.clickHandler = function(event) {
  event.preventDefault();
  return this.toggle();
};

RichTile.prototype.keyHandler = function(event) {
  if (this.options.toggleKeyCodes.indexOf(event.which) > -1) {
    event.preventDefault();
    return this.toggle();
  }
};

$.fn.richTile = function(option) {
  return this.each(function() {
    var data = $.data(this, RichTile.DATA_KEY);

    if (!data) {
      $.data(this, RichTile.DATA_KEY, (data = new RichTile(this, typeof option === 'object' && option)));
    }
    
    if (typeof option === 'string') {
      data[option]();
    }
  });
};

/**
 * Apply plugin and account for desired behavior outside of individual toggles.
 */

$('.js-tile').richTile().on({
  'expanded.RichTile': function(event, tile) {
    // disable siblings on expand
    var siblings = tile.element.siblings('.js-tile');
    siblings.richTile('disable');
    // re-enable when this tile is collapsed
    tile.element.one('collapsed.RichTile', function() {
      siblings.richTile('enable');
    });
  }
});