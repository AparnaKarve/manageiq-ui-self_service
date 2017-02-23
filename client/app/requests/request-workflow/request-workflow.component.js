import templateUrl from './request-workflow.html';

export const RequestWorkflowComponent = {
  bindings: {
    workflow: '=?',
    workflowClass: '=?',
    allowedTags: '=?',
  },
  templateUrl,
  controller: requestWorkflowController,
  controllerAs: 'vm',
};

/** @ngInject */
function requestWorkflowController(API_BASE, lodash, CollectionsApi, $q) {
  var vm = this;
  vm.$onInit = activate;
  vm.customizedWorkflow = {};

  vm.API_BASE = API_BASE;

  function activate() {
    if (vm.workflow) {
      initCustomizedWorkflow();

      var promiseObject = {};
      nodeTypeTitle('clusters', promiseObject);
      nodeTypeTitle('hosts', promiseObject);

      $q.all(promiseObject).then(function(data) {
        vm.clusterTitle = getClusterTitle(data.clusters);
        vm.hostTitle = getHostTitle(data.hosts);

        angular.forEach(vm.customizedWorkflow.dialogOrder, setTabPanelTitleForEnabledDialog);
      });
    }
  }

  // Private functions
  function initCustomizedWorkflow(key) {
    vm.customizedWorkflow.dialogOrder = lodash.cloneDeep(vm.workflow.dialogs.dialog_order);
    vm.customizedWorkflow.dialogs = lodash.cloneDeep(vm.workflow.dialogs.dialogs);
    vm.customizedWorkflow.values = lodash.cloneDeep(vm.workflow.values);
    processWorkflowValues();
  }

  function processWorkflowValues() {
    angular.forEach(vm.customizedWorkflow.values, function (value, key) {
      if (angular.isArray(value)) {
        vm.customizedWorkflow.values[key] = value[1];
      }
    });
  }
    
  vm.bEnableDialog = function(dialog) {
    if (!vm.customizedWorkflow.values[dialog + '_enabled']
      || vm.customizedWorkflow.values[dialog + '_enabled'][0] === "enabled") {
      return true;
    } else {
      return false;
    }
  };

  function setTabPanelTitleForEnabledDialog(dialog) {
    if (vm.bEnableDialog(dialog)) {
      setTabPanelTitle(dialog);
    }
  }

  function setTabPanelTitle(key) {
    var fields = {};

    vm.customizedWorkflow.dialogs[key].panelTitle = [];
    populateTabs(key);

    function populateTabs(key) {
      var panelFields, panelTitles;
      switch (key) {
        case 'requester':
          panelTitles = [__("Request Information"), __("Manager")];
          panelFields = [['owner_email', 'owner_first_name', 'owner_last_name', 'owner_address', 'owner_city',
            'owner_state', 'owner_zip', 'owner_country', 'owner_title', 'owner_company',
            'owner_department', 'owner_office', 'owner_phone', 'owner_phone_mobile', 'request_notes'],
            ['owner_manager', 'owner_manager_mail', 'owner_manager_phone']];

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'purpose':
          panelTitles = [__("Select Tags to apply")];
          panelFields = [['vm_tags']];

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'service':
          if (lodash.every(["Redhat", "InfraManager"], function (value, key) {
            return lodash.includes(vm.workflowClass, value);
          })) {
            panelTitles = [__("Selected VM")];
          } else {
            panelTitles = [__("Select")];
          }
          if (lodash.includes(vm.customizedWorkflow.values.provision_type, "pxe")) {
            panelTitles.push(__("PXE"));
          } else if (lodash.includes(vm.customizedWorkflow.values.provision_type, "iso")) {
            panelTitles.push(__("ISO"));
          }
          if (lodash.includes(vm.workflowClass, "CloudManager")) {
            panelTitles.push(__("Number of Instances"));
          } else {
            panelTitles.push(__("Number of VMs"));
          }
          panelTitles.push(__("Naming"));

          if (lodash.every(["Redhat", "InfraManager"], function(value, key) {
            return lodash.includes(vm.workflowClass, value);
          })) {
            panelFields = [['src_vm_id', 'provision_type', 'linked_clone'],
                           ['number_of_vms'],
                           ['vm_name', 'vm_description', 'vm_prefix']];
          } else {
            panelFields = [['vm_filter', 'src_vm_id', 'provision_type', 'linked_clone', 'snapshot'],
                           ['number_of_vms'],
                           ['vm_name', 'vm_description', 'vm_prefix']];
          }

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'environment':
          panelTitles = [__("Placement")];

          if (vm.customizedWorkflow.values.placement_auto === 0
            && !lodash.includes(vm.workflowClass, "CloudManager")) {
            panelTitles.push(__("Datacenter"));
            panelTitles.push(vm.clusterTitle);
            if (lodash.every(["Vmware", "InfraManager"], function(value, key) {
              return lodash.includes(vm.workflowClass, value);
            })) {
              panelTitles.push(__("Resource Pool"));
              panelTitles.push(__("Folder"));
            }

            panelTitles.push(vm.hostTitle);

            if (!lodash.includes(vm.workflowClass, "CloudManager")) {
              panelTitles.push(__("Datastore"));
            } else {
              panelTitles.push(__("Placement - Options"));
            }
          }
          panelFields = [
            ['placement_auto'],
            ['placement_dc_name'],
            ['cluster_filter', 'placement_cluster_name'],
            ['rp_filter', 'placement_rp_name'],
            ['placement_folder_name'],
            ['host_filter', 'placement_host_name'],
            ['ds_filter', 'placement_storage_profile', 'placement_ds_name'],
            ['cloud_tenant', 'availability_zone_filter', 'placement_availability_zone', 'cloud_network', 'cloud_subnet',
              'security_groups', 'floating_ip_address', 'resource_group'],
          ];

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'hardware':
          if (lodash.includes(vm.workflowClass, "CloudManager")) {
            panelTitles = [__("Properties")];
          } else {
            panelTitles = [__("Hardware"), __("VM Limits"), __("VM Reservations")];
          }
          panelFields = [
            ['instance_type', 'number_of_cpus', 'number_of_sockets', 'cores_per_socket', 'vm_memory',
              'network_adapters', 'disk_format', 'guest_access_key_pair', 'monitoring', 'vm_dynamic_memory',
              'vm_minimum_memory', 'vm_maximum_memory', 'boot_disk_size', 'is_preemptible'],
            ['cpu_limit', 'memory_limit'],
            ['cpu_reserve', 'memory_reserve'],
          ];

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'network':
          panelTitles = [__("Network Adapter Information")];
          panelFields = [['vlan', 'mac_address']];

          fields = getFields(key, panelTitles, panelFields);
          break;
        case 'customize':
          // vm.customizedWorkflow.dialogs[key].panelTitle[0] = (__("Credentials"));
          // vm.customizedWorkflow.dialogs[key].panelTitle[1] = (__("IP Address Information"));
          // vm.customizedWorkflow.dialogs[key].panelTitle[2] = (__("DNS"));
          // vm.customizedWorkflow.dialogs[key].panelTitle[3] = (__("Customize Template"));
          // vm.customizedWorkflow.dialogs[key].panelTitle[4] = (__("Selected Template Contents"));
          fields = populateCustomize(key, panelTitles, panelFields);
          break;
        case 'schedule':
          vm.customizedWorkflow.dialogs[key].panelTitle[0] = (__("Schedule Info"));
          vm.customizedWorkflow.dialogs[key].panelTitle[1] = (__("Lifespan"));
          break;
      }
      fieldsLayout(key, fields, vm.customizedWorkflow.dialogs[key].panelTitle.length);
    }
  }

  function populateCustomize(key, panelTitles, panelFields) {
    var fieldsArr = [['sysprep_enabled']];

    if (!allFieldsHidden(key, fieldsArr)) {
      panelTitles = [__("Basic Options")];
      panelFields = fieldsArr;
    }

    if (lodash.includes(vm.workflow.values.sysprep_enabled, 'fields')) {
      fieldsArr = ['sysprep_custom_spec', 'sysprep_spec_override'];

      if (!allFieldsHidden(key, fieldsArr)) {
        panelTitles.push(__("Custom Specification"));
        panelFields.push(fieldsArr);
      }
    }

    vm.vmOS = 'linux'; // hardcoded

    if (vm.vmOS === 'windows') {
      fieldsArr = ['sysprep_timezone',
        'sysprep_auto_logon',
        'sysprep_auto_logon_count',
        'sysprep_password'];

      if (!allFieldsHidden(key, fieldsArr)) {
        panelTitles.push(__("Unattended GUI"));
        panelFields.push(fieldsArr);
      }
      // }

      fieldsArr = ['sysprep_identification'];
      if (!allFieldsHidden(key, fieldsArr)) {
        panelTitles.push(__("Identification"));
        panelFields.push(fieldsArr);
      }

      if (lodash.includes(vm.workflow.values.sysprep_identification, 'domain')) {
        // @ldap_ous_tree ? :ldap_ous : nil, :sysprep_domain_admin // after sysprep_domain_name
        fieldsArr = ['sysprep_domain_name', 'sysprep_domain_password'];

        if (!allFieldsHidden(key, fieldsArr)) {
          panelTitles.push(__("Domain Information"));
          panelFields.push(fieldsArr);
        }
      } else {
        fieldsArr = ['sysprep_workgroup_name'];

        if (!allFieldsHidden(key, fieldsArr)) {
          panelTitles.push(__("Workgroup Information"));
          panelFields.push(fieldsArr);
        }

        fieldsArr = ['sysprep_full_name', 'sysprep_organization', 'sysprep_product_id', 'sysprep_computer_name'];

        if (!allFieldsHidden(key, fieldsArr)) {
          panelTitles.push(__("User Data"));
          panelFields.push(fieldsArr);
        }

        fieldsArr = ['sysprep_change_sid', 'sysprep_delete_accounts'];

        if (!allFieldsHidden(key, fieldsArr)) {
          panelTitles.push(__("Windows Options"));
          panelFields.push(fieldsArr);
        }

        fieldsArr = ['sysprep_server_license_mode', 'sysprep_per_server_max_connections'];

        if (!allFieldsHidden(key, fieldsArr)) {
          panelTitles.push(__("Server License"));
          panelFields.push(fieldsArr);
        }
      }
    } else if (vm.vmOS === 'linux') {
      fieldsArr = ['linux_host_name', 'linux_domain_name'];

      if (!allFieldsHidden(key, fieldsArr)) {
        panelTitles.push(__("Naming"));
        panelFields.push(fieldsArr);
      }
    }

    // You are here: - elsif (@edit && @edit[:new] && @edit[:new][:sysprep_enabled] && @edit[:new][:sysprep_enabled][0]
    // == "file") || (@options && @options[:sysprep_enabled] && @options[:sysprep_enabled][0] == "file")

    // next step : DRY up!

    return getFields(key, panelTitles, panelFields);
  }

  function allFieldsHidden(key, panelFields) {
    if (lodash.find(panelFields, function(value) {
      return vm.customizedWorkflow.dialogs[key].fields[value].display !== 'hide';
    })) {
      return false;
    } else {
      return true;
    }
  }
  
  function setSubPanelTitleAndFields(nPanel, key, panelTitle, arrFields) {
    var fieldsObject = {};
    var i = 0;

    vm.customizedWorkflow.dialogs[key].panelTitle[nPanel] = panelTitle;

    lodash.forEach(arrFields, function (value) {
      var obj = {label: value, panel: nPanel, order: i++};
      var tempObj = {};

      tempObj[value] = obj;
      lodash.merge(fieldsObject, tempObj);
    });

    return fieldsObject;
  }

  function getFields(key, panelTitles, panelFields) {
    var i = 0;
    var j = 0;
    var fields = {};
    lodash.forEach(panelTitles, function (panelTitle) {
      lodash.merge(fields, setSubPanelTitleAndFields(i++, key, panelTitle, panelFields[j++]));
    });

    return fields;
  }

  function fieldsLayout(tab, fields, nPanels) {
    vm.customizedWorkflow.dialogs[tab].fieldsInPanel = [];

    vm.customizedWorkflow.dialogs[tab].fields
      = lodash.filter(lodash.merge(vm.customizedWorkflow.dialogs[tab].fields,
      lodash.mapKeys(fields, function (v, k) { return k; })),
        function(o) { return angular.isDefined(o.display); });

    lodash.times(nPanels, function(key, value) {
      vm.customizedWorkflow.dialogs[tab].fieldsInPanel[key]
        = Object.values(lodash.filter(vm.customizedWorkflow.dialogs[tab].fields, {'panel': key}));
    });
  }

  function nodeTypeTitle(collection, promiseObject) {
    promiseObject[collection] = CollectionsApi.options(collection);
  }

  function getClusterTitle(response) {
    var title;

    switch (response.data.node_types) {
      case 'non_openstack':
        title = __("Cluster");
        break;
      case 'openstack':
        title = __("Deployment Role");
        break;
      default:
        title = __("Cluster / Deployment Role");
        break;
    }

    return title;
  }

  function getHostTitle(response) {
    var title;

    switch (response.data.node_types) {
      case 'non_openstack':
        title = __("Host");
        break;
      case 'openstack':
        title = __("Node");
        break;
      default:
        title = __("Host / Node");
        break;
    }

    return title;
  }
}
