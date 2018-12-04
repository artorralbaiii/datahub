var app = require('./app');
var currentUser = {};

app.on('rendered', function (rendered) {
    $('#main').html(rendered);
});

$(document).ready(function () {

    $.get('http://localhost:3000/user', function (data) {
        if (data.success) {
            if (data.data === undefined || data.data.length == 0) {
                app.emit('view-selected', 'profile');

                $('#spinner').hide();

                $('#btn-p-save').bind('click', function (e) {
                    if (validateProfileForm()) {
                        e.preventDefault();
                        return;
                    }

                    $('#spinner').show();
                    var formData = {
                        brid: $('#fld-p-brid').val(),
                        email: $('#fld-p-email').val(),
                        fullname: $('#fld-p-name').val()
                    };

                    $.post('http://localhost:3000/user', formData)
                        .done(function (data) {
                            currentUser = data.data;
                            app.emit('view-selected', 'main');
                            loadMain();
                        })
                        .fail(function (xhr, status, error) {
                            alert('ERROR: ' + JSON.stringify(error));
                        });
                });

                function validateProfileForm() {
                    let validate = false;

                    if ($('#fld-p-brid').val().trim() === '') {
                        $('#fld-p-brid-help').removeClass('d-none');
                        validate = true;
                    } else {
                        if (!$('#fld-p-brid-help').hasClass('d-none')) {
                            $('#fld-p-brid-help').addClass('d-none');
                        }
                    }

                    if ($('#fld-p-email').val().trim() === '') {
                        $('#fld-p-email-help').removeClass('d-none');
                        validate = true;
                    } else {
                        if (!$('#fld-p-email-help').hasClass('d-none')) {
                            $('#fld-p-email-help').addClass('d-none');
                        }
                    }

                    if ($('#fld-p-name').val().trim() === '') {
                        $('#fld-p-name-help').removeClass('d-none');
                        validate = true;
                    } else {
                        if (!$('#fld-p-name-help').hasClass('d-none')) {
                            $('#fld-p-name-help').addClass('d-none');
                        }
                    }

                    return validate;
                }

            } else {
                currentUser = data.data[0];
                loadMain();
            }
        } else {
            alert('ERROR: ' + JSON.stringify(data.message));
        }
    });

});

function loadAuditTrail() {
    app.emit('view-selected', 'audittrail');
    $('#user-info-p').append(currentUser.FULLNAME);

    var columns = [
        { 'data': 'TimeStamp' },
        { 'data': 'Action' },
        { 'data': 'FULLNAME' },
        { 'data': 'FieldChanged' },
        { 'data': 'NewValue' },
        { 'data': 'AffectedRecords' },
        { 'data': 'Comments' }
    ];

    var table = $('#data-table-audit').DataTable({
        order: [[ 0, 'desc' ]],
        dom: 'Bfrtip',
        buttons: {
            buttons: [
                {
                    text: 'Back to Main Page',
                    action: function (e, dt, node, config) {
                        loadMain();
                    }
                },
                { extend: 'copyHtml5', className: 'btn' },
                { extend: 'csvHtml5', className: 'btn' }
            ]
        }, 
        'ajax': 'http://localhost:3000/audit',
        'columns': columns,
        'drawCallback': function (settings) {
            $('#spinner').hide();
        }
    });

}

function loadMain() {
    app.emit('view-selected', 'main');
    $('#user-info').append(currentUser.FULLNAME);

    var columns = [
        { 'data': 'ID' },
        { 'data': 'InterfaceId' },
        { 'data': 'TableName' },
        { 'data': 'TableDescription' },
        { 'data': 'Subtype' },
        { 'data': 'FieldName' },
        { 'data': 'FieldDescription' },
        { 'data': 'DataType' },
        { 'data': 'Length' },
        { 'data': 'OutputType' },
        { 'data': 'OutputLength' },
        { 'data': 'Notation' },
        { 'data': 'OtherInfo' }
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
                {
                    text: 'Audit Trail',
                    action: function (e, dt, node, config) {
                        loadAuditTrail();
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
        })
        .on('deselect.dt', function (e, dt, type, indexes) {
            selectedRecords.pop(table.rows(indexes).data().toArray()[0])
        })
        .on('error.dt', function (e, settings, techNote, message) {
            alert('ERROR: ' + JSON.stringify(message));
        })
        .on('dblclick', 'tr', function () {
            var data = table.row( this ).data();
            alert( 'You clicked on '+data[0]+'\'s row' );
            } );

    // Populate Options in 'Field' dropdown.
    $.each(columns.slice(1), function (key, value) {
        $('#fld-field').prepend('<option value="' + value.data + '">' + value.data + '</option>');
    });

    // Click event for Update Button
    $('#btn-update').bind('click', function () {
        $('#spinner').show();
        var formData = {
            field: '',
            value: '',
            comments: '',
            rows: []
        };

        formData.field = $('#fld-field').val();
        formData.value = $('#fld-newvalue').val();
        formData.comments = $('#fld-comments').val();
        formData.rows = selectedRecords;

        $.post('http://localhost:3000/data', formData)
            .done(function (data) {
                if (data.success) {
                    table.rows().deselect();
                    selectedRecords = [];
                    table.ajax.reload();
                } else {
                    $('#spinner').hide();
                    alert('ERROR: ' + JSON.stringify(data));
                }
            })
            .fail(function (xhr, status, error) {
                alert('ERROR: ' + JSON.stringify(error));
            });
    });

    $('#btn-save').bind('click', function (e) {

        if ($('#fld-interface-id').val().trim() === '') {
            $('#fld-interface-id-help').removeClass('d-none');
            e.preventDefault();
            return;
        } else {
            if (!$('#fld-interface-id-help').hasClass('d-none')) {
                $('#fld-interface-id-help').addClass('d-none');
            }
        }

        $('#spinner').show();

        var formData = {
            interfaceId: $('#fld-interface-id').val(),
            tableName: $('#fld-table-name').val(),
            tableDescription: $('#fld-table-desc').val(),
            subType: $('#fld-subtype').val(),
            fieldName: $('#fld-fld-name').val(),
            fieldDescription: $('#fld-fld-desc').val(),
            dataType: $('#fld-data-type').val(),
            fieldLength: $('#fld-length').val(),
            outputType: $('#fld-output-type').val(),
            outputLength: $('#fld-output-length').val(),
            notation: $('#fld-notation').val(),
            otherInfo: $('#fld-other-info').val()
        };

        $.post('http://localhost:3000/data/new', formData)
            .done(function (data) {
                if (data.success) {
                    table.ajax.reload();
                    $('#dlg-add-record').modal('hide');
                } else {
                    $('#spinner').hide();
                    alert('ERROR: ' + JSON.stringify(data));
                }
            })
            .fail(function (xhr, status, error) {
                alert('ERROR: ' + JSON.stringify(error));
            });
    });
}


