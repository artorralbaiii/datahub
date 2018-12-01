var app = require('./app');

app.on('rendered', function (rendered) {
    $('#main').html(rendered);
});

(function () {
    app.emit('view-selected', 'main');
})();

$(document).ready(function () {

    var columns = [
        { 'data': 'NAME' },
        { 'data': 'POSITION' },
        { 'data': 'OFFICE' },
        { 'data': 'EXTN' },
        { 'data': 'START_DATE' },
        { 'data': 'SALARY' }
    ];
    var selectedRecords = [];

    var table = $('#data-table').DataTable({
        dom: 'Bfrtip',
        buttons: {
            buttons: [
                {
                    text: 'Add',
                    action: function (e, dt, node, config) {
                        $('#dlg-add-record').modal('show');
                    }
                },
                {
                    text: 'Update Selected Row(s)',
                    action: function (e, dt, node, config) {
                        if (selectedRecords === undefined || selectedRecords.length == 0) {
                            alert('Please select a record.');
                        } else {
                            $('#dlg-update-sel-rows').modal('show');
                        }
                    }
                },
                { extend: 'copyHtml5', className: 'btn' },
                { extend: 'csvHtml5', className: 'btn' }
            ]
        },
        select: 'multi',
        'ajax': 'http://localhost:3000/data',
        'columns': columns,
        'drawCallback': function (settings) {
            $('#spinner').hide();
        }
    });
    table
        .on('select.dt', function (e, dt, type, indexes) {
            selectedRecords.push(table.rows(indexes).data().toArray()[0]);
            console.log(selectedRecords);
            // var rowData = table.rows(indexes).data().toArray();
            // events.prepend('<div><b>' + type + ' selection</b> - ' + JSON.stringify(rowData) + '</div>');
        })
        .on('deselect.dt', function (e, dt, type, indexes) {
            selectedRecords.pop(table.rows(indexes).data().toArray()[0])
            // var rowData = table.rows(indexes).data().toArray();
            // events.prepend('<div><b>' + type + ' <i>de</i>selection</b> - ' + JSON.stringify(rowData) + '</div>');
        });

    // Populate Options in 'Field' dropdown.
    $.each(columns, function (key, value) {
        $('#fld-field').prepend('<option value="' + value.data + '">' + value.data + '</option>');
    });

    // Click event for Update Button
    $('#btn-update').bind('click', function () {


        $('#spinner').show();
        var formData = {
            field: '',
            value: '',
            rows: []
        };

        formData.field = $('#fld-field').val();
        formData.value = $('#fld-newvalue').val();
        formData.rows = selectedRecords;

        $.post('http://localhost:3000/data', formData, function (data) {
            console.log(data);
            table.rows().deselect();
            selectedRecords = [];
            table.ajax.reload();
        });

    });

});