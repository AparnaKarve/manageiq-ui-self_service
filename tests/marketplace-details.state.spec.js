describe('Catalogs.details', function() {
  beforeEach(function() {
    module('app.states', bard.fakeToastr);
  });

  describe('#resolveDialogs', function() {
    var collectionsApiSpy;

    beforeEach(function() {
      bard.inject('$state', '$stateParams', 'CollectionsApi');

      $stateParams.serviceTemplateId = 123;
      collectionsApiSpy = sinon.spy(CollectionsApi, 'query');
    });

    it('should query the API with the correct template id and options', function() {
      var options = {expand: 'resources', attributes: 'content'};
      $state.get('catalogs.details').resolve.dialogs($stateParams, CollectionsApi);
      expect(collectionsApiSpy).to.have.been.calledWith('service_templates/123/service_dialogs', options);
    });
  });

  describe('controller', function() {
    var collectionsApiSpy;
    var controller;
    var notificationsErrorSpy;
    var notificationsSuccessSpy;
    var dialogs = {
      subcount: 1,
      resources: [{
        content: [{
          dialog_tabs: [{
            dialog_groups: [{
              dialog_fields: [{
                name: 'dialogField1',
                default_value: '1'
              }, {
                name: 'dialogField2',
                default_value: '2'
              }]
            }]
          }]
        }]
      }]
    };

    var serviceTemplate = {id: 123, service_template_catalog_id: 321};

    var controllerResolves = {
      dialogs: dialogs,
      serviceTemplate: serviceTemplate
    };

    beforeEach(function() {
      bard.inject('$controller', '$log', '$state', '$rootScope', 'CollectionsApi', 'Notifications');

      controller = $controller($state.get('catalogs.details').controller, controllerResolves);
    });

    describe('controller initialization', function() {
      it('is created successfully', function() {
        expect(controller).to.be.defined;
      });
    });
  });
});
