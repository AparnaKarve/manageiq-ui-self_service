(function() {
  'use strict';

  angular.module('app.components')
    .component('requestWorkflow', {
      bindings: {
        workflow: '=?',
        inputDisabled: '=?',
      },
      controller: requestWorkflowController,
      controllerAs: 'vm',
      templateUrl: 'app/components/request-workflow/request-workflow.html',
    });

  /** @ngInject */
  function requestWorkflowController(API_BASE, lodash) {
    var vm = this;
    vm.$onInit = activate;
    vm.parsedWorkflow = {};
    // vm.parsedWorkflow['dialog_order'] = [];
    // vm.parsedWorkflow['dialog_order']['panelTitle'] = [];
    vm.dateOptions = {
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
    };
    vm.supportedDialog = true;
    vm.API_BASE = API_BASE;

    function activate() {
      if (vm.workflow) {
        // angular.forEach(vm.workflow, parseWorkflow);
        parseWorkflow();
        angular.forEach(vm.parsedWorkflow['dialog_order'], setTabPanelTitle);
        var a = 1;
      }
      // if (angular.isDefined(vm.dialog) && angular.isArray(vm.dialog.dialog_tabs)) {
      //   vm.dialog.dialog_tabs.forEach(iterateBGroups);
      // }
    }

    // Private functions
    function parseWorkflow(value, key) {
      // vm.parsedWorkflow[key.replace('dialog_', '')] = value;
      vm.parsedWorkflow['dialog_order'] = vm.workflow.dialogs.dialog_order;
      vm.parsedWorkflow['dialogs'] = vm.workflow.dialogs.dialogs;
      // vm.parsedWorkflow['sortedFields'] = Object.values(vm.parsedWorkflow['dialogs']['requester'].fields);
    }

    function setTabPanelTitle(key) {
      switch (key) {
        case 'requester':
          vm.parsedWorkflow['dialogs'][key].panelTitle0 = (__("Request Information"));
          vm.parsedWorkflow['dialogs'][key].panelTitle1 = (__("Manager"));
          // angular.forEach(vm.parsedWorkflow['dialogs'][key].fields, orderRequesterFields);
          orderRequesterFields2();
          break;
        case 'purpose':
          vm.parsedWorkflow['dialogs'][key].panelTitle0 = (__("Select Tags to apply"));
          break;
        case 'service':
          vm.parsedWorkflow['dialogs'][key].panelTitle0 = (__("Selected VM"));
          vm.parsedWorkflow['dialogs'][key].panelTitle1 = (__("Number of VMs"));
          vm.parsedWorkflow['dialogs'][key].panelTitle2 = (__("Naming"));
          break;
        default:
          vm.parsedWorkflow['dialogs'][key].panelTitle0 = (__("Default Information"));
          break;
      }
    }

    function orderRequesterFields(key, field) {
          var i = 4;
          switch (field) {
            case 'owner_email':
              vm.parsedWorkflow['dialogs']['requester'].fields[field].order = 0;
              break;
            case 'owner_first_name':
              vm.parsedWorkflow['dialogs']['requester'].fields[field].order = 1;
              break;
            case 'owner_last_name':
              vm.parsedWorkflow['dialogs']['requester'].fields[field].order = 2;
              break;
            case 'request_notes':
              vm.parsedWorkflow['dialogs']['requester'].fields[field].order = 3;
              break;
            default:
              vm.parsedWorkflow['dialogs']['requester'].fields[field].order = i ++;
              break;
          }

      vm.parsedWorkflow['dialogs']['requester']['sortedFields'] = Object.values(vm.parsedWorkflow['dialogs']['requester'].fields);

      // console.log(index[0]);

    }

    function orderRequesterFields2 (key, field) {
      var fields = {
        owner_email         : { label: 'owner_email', panel: 0, order : 0 },
        owner_first_name    : { label: 'owner_first_name', panel: 0, order : 1 },
        owner_last_name     : { label: 'owner_last_name', panel: 0, order : 2 },
        owner_address       : { label: 'owner_address', panel: 0, order : 3 },
        owner_city          : { label: 'owner_city', panel: 0, order : 4 },
        owner_state         : { label: 'owner_state', panel: 0, order : 5 },
        owner_zip           : { label: 'owner_zip', panel: 0, order : 6 },
        owner_country       : { label: 'owner_country', panel: 0, order : 7 },
        owner_title         : { label: 'owner_title', panel: 0, order : 8 },
        owner_company       : { label: 'owner_company', panel: 0, order : 9 },
        owner_department    : { label: 'owner_department', panel: 0, order : 10 },
        owner_office        : { label: 'owner_office', panel: 0, order : 11 },
        owner_phone         : { label: 'owner_phone', panel: 0, order : 12 },
        owner_phone_mobile  : { label: 'owner_phone_mobile', panel: 0, order : 13 },
        request_notes       : { label: 'request_notes', panel: 0, order : 14 },
        owner_manager       : { label: 'owner_manager', panel: 1, order : 0 },
        owner_manager_mail  : { label: 'owner_manager_mail', panel: 1, order : 1 },
        owner_manager_phone : { label: 'owner_manager_phone', panel: 1, order : 2 },
      };

      _.merge(vm.parsedWorkflow['dialogs']['requester'].fields, fields);

      // var panel0Fields = _.pickBy(data, function(value, key) {
      //   return key == panel && value == 0;
      // });

      // vm.parsedWorkflow['dialogs']['requester']['sortedFieldsForPanel0'] = Object.values(vm.parsedWorkflow['dialogs']['requester'].fields);

      // var panel0Fields = _.pick(vm.parsedWorkflow['dialogs']['requester'].fields, function(value, key) {return key == "panel" && value == 0;});
      // _.filter(vm.parsedWorkflow['dialogs']['requester'].fields, { 'panel': 0});

      vm.parsedWorkflow['dialogs']['requester']['sortedFieldsForPanel0'] =
        Object.values(_.filter(vm.parsedWorkflow['dialogs']['requester'].fields, { 'panel': 0}));

      vm.parsedWorkflow['dialogs']['requester']['sortedFieldsForPanel1'] =
        Object.values(_.filter(vm.parsedWorkflow['dialogs']['requester'].fields, { 'panel': 1}));



    }

    function iterateBGroups(item) {
      item.dialog_groups.forEach(iterateBFields);
    }

    function iterateBFields(item) {
      if (lodash.result(lodash.find(item.dialog_fields, {'dynamic': true}), 'name')
        || lodash.result(lodash.find(item.dialog_fields, {'type': 'DialogFieldTagControl'}), 'name')) {
        vm.supportedDialog = false;
      }
    }
  }
})();
