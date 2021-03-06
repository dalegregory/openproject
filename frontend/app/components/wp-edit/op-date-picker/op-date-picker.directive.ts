// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

interface opDatePickerScope extends ng.IScope {
  onDeactivate:Function,
  onChange:Function
}

function opDatePickerLink(scope:opDatePickerScope, element:ng.IAugmentedJQuery, attrs, ngModel) {
  // we don't want the date picker in the accessibility mode
  if (this.ConfigurationService.accessibilityModeEnabled()) {
    return;
  }

  let input = element.find('.hidden-date-picker-input');
  let datePickerContainer = element.find('.ui-datepicker--container');
  let datePickerInstance;
  let DatePicker = this.Datepicker;
  let onDeactivate = scope.onDeactivate;
  let onChange = scope.onChange;
  let onClickCallback;

  let unbindNgModelInitializationWatch = scope.$watch(() => ngModel.$viewValue !== NaN, () => {
    showDatePicker();
    unbindNgModelInitializationWatch();
  });

  function hide() {
    datePickerInstance.hide();
    unregisterClickCallback();
  }

  function registerClickCallback() {
    // HACK: we need to bind to 'mousedown' because the wp-edit-field.directive
    // binds to 'click' and stops the event propagation
    onClickCallback = angular.element('body').bind('mousedown', e => {
      let target = angular.element(e.target);
      let parentSelector =
        '.ui-datepicker-header, .' + datePickerContainer.attr('class').split(' ').join('.');

      if (!target.is(input) &&
        target.parents(parentSelector).length <= 0) {

        hide();
        onDeactivate();
      }
    });
  }

  function unregisterClickCallback() {
    angular.element('body').unbind('mousedown', onClickCallback);
  }

  function showDatePicker() {
    datePickerInstance = new DatePicker(datePickerContainer, input, ngModel.$viewValue);

    datePickerInstance.onChange = (date) => {
      ngModel.$setViewValue(date);
      onChange();
    };

    datePickerInstance.onDone = () => {
      onChange();
    };

    registerClickCallback();
  }
}

function opDatePicker(ConfigurationService, Datepicker) {
  var dependencies = {
    ConfigurationService: ConfigurationService,
    Datepicker: Datepicker
  };

  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/components/wp-edit/op-date-picker/op-date-picker.directive.html',
    // http://stackoverflow.com/a/33614939/3206935
    link: angular.bind(dependencies, opDatePickerLink),
    require: 'ngModel',
    scope: {
      onChange: "&",
      onDeactivate: "&"
    }
  };
}

angular
  .module('openproject')
  .directive('opDatePicker', opDatePicker);
