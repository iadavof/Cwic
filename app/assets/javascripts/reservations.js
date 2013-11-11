APP.reservations = {
    new: function() {
      APP.reservations.organisation_client_dropdown();
    },
    edit: function() {
      APP.reservations.organisation_client_dropdown();
    },
    create: function() {
      APP.reservations.organisation_client_dropdown();
    },
    organisation_client_dropdown: function() {
      $('input#organisation_client_select').select2({
        initSelection: function(element, callback) {
            var id = $(element).val();
            var text = $(element).data('prev-selected') || '';
            return callback({id: id, text: text });
        },
        minimumInputLength: 1,
        width: 'resolve',
        ajax: {
          url: Routes.organisation_search_organisation_client_path(current_organisation) + '.json',
          dataType: 'json',
          data: function (term) {
            return {
              q: term, // search term
            };
          },
          results: function (data) {
            return {results: $.map(data, function(item){
              return { id: item.id, text: item.instance_name}
            })};
          }
        },
      });
    },
}