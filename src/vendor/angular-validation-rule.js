'use strict';

(function() {
  window.angular
    .module('validation.rule', ['validation'])
    .config(['$validationProvider', function($validationProvider) {
      var expression = {
        required: function(value) {
          return !!value;
        },
        url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
        number: /^\d+$/,
        minlength: function(value, scope, element, attrs, param) {
          return value.length >= param;
        },
        maxlength: function(value, scope, element, attrs, param) {
          return value.length <= param;
        },
        byType: function(value, scope, element, attrs, param) {
          var valid = false;
          switch(attrs.validType) {
            case 'integer':
            case 'long':
              if (/^\d+$/.test(value)) {
                valid = true;
              }
              break;
            case 'double':
              if (/^(\d*\.)?\d+$/.test(value)) {
                valid = true;
              }
              break;
            case 'boolean':
              if (value === 'true' || value === 'false') {
                valid = true;
              }
              break;
            case 'date':
              valid = (new Date(value).getDate() == value.substring(value.length - 2));
              break;
            default:
              valid = true;
          }

          return valid;
        }
      };

      var defaultMsg = {
        required: {
          error: 'This should be required',
          success: ''
        },
        url: {
          error: 'This should be url',
          success: ''
        },
        email: {
          error: 'This should be email',
          success: ''
        },
        number: {
          error: 'This should be number',
          success: ''
        },
        minlength: {
          error: 'This should be longer',
          success: ''
        },
        maxlength: {
          error: 'This should be shorter',
          success: ''
        },
        byType: {
          error: 'This should be the type as you selected',
          success: ''
        }
      };
      $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
    }]);
})();
