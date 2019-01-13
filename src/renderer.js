var app = require('./app');
var currentUser = {};
var initMain = true;
var initAuditTrail = true;
var tableAuditTrail;

app.on('rendered', function (rendered) {
    $('#main').html(rendered);
});

$(document).ready(function () {
    // $('#data-table-audit_wrapper').hide();
    // $('#data-table-audit').hide();
    // $('#data-table_wrapper').hide();
    $('#container-interface').hide();
    $('#container-audit').hide();

    app.emit('view-selected', 'main');

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
                            currentUser = {
                                BRID: formData.brid,
                                FULLNAME: formData.fullname,
                                EMAIL: formData.email
                            };
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
    // app.emit('view-selected', 'audittrail');
    // $('#user-info-p').append(currentUser.FULLNAME);
    // $('#data-table-audit_wrapper').show();
    // $('#data-table_wrapper').hide();
    $('#container-audit').show();
    $('#container-interface').hide();

    var columns = [
        { 'data': 'TimeStamp' },
        { 'data': 'Action' },
        { 'data': 'FULLNAME' },
        { 'data': 'FieldChanged' },
        { 'data': 'NewValue' },
        { 'data': 'AffectedRecords' },
        { 'data': 'Comments' }
    ];

    if (initAuditTrail) {

        initAuditTrail = false

        tableAuditTrail = $('#data-table-audit').DataTable({
            order: [[0, 'desc']],
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
    } else {
        tableAuditTrail.ajax.reload();
    }

}

function loadMain() {
    $('#container-audit').hide();
    $('#container-interface').show();
    
    var columns = [
        { 'data': 'ID' },
        { 'data': 'InterfaceId' },
        { 'data': 'InterfaceName' },
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
    
    if (initMain) {
        $('#user-info').append(currentUser.FULLNAME);
        initMain = false;
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
                var data = table.row(this).data();
                setFields(data);
                $('#dlg-add-record').modal('show');
            });

        // Populate Options in 'Field' dropdown.
        $.each(columns.slice(1), function (key, value) {
            $('#fld-field').prepend('<option value="' + value.data + '">' + value.data + '</option>');
        });

        // Click event for Update Button
        $('#btn-update').bind('click', function (e) {

            if ($('#fld-newvalue').val().trim() === '') {
                $('#fld-newvalue-help').removeClass('d-none');
                e.preventDefault();
                return;
            } else {
                if (!$('#fld-newvalue-help').hasClass('d-none')) {
                    $('#fld-newvalue-help').addClass('d-none');
                }
            }

            if ($('#fld-comments').val().trim() === '') {
                $('#fld-comments-help').removeClass('d-none');
                e.preventDefault();
                return;
            } else {
                if (!$('#fld-comments-help').hasClass('d-none')) {
                    $('#fld-comments-help').addClass('d-none');
                }
            }

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
                        $('#dlg-update-sel-rows').modal('hide');
                        $('#fld-newvalue').val('');
                        $('#fld-comments').val('');
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

            if ($('#fld-interface-name').val().trim() === '') {
                $('#fld-interface-name-help').removeClass('d-none');
                e.preventDefault();
                return;
            } else {
                if (!$('#fld-interface-name-help').hasClass('d-none')) {
                    $('#fld-interface-name-help').addClass('d-none');
                }
            }

            $('#spinner').show();

            var formData = {
                id: $('#fld-id').val(),
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
                otherInfo: $('#fld-other-info').val(),
                interfaceName: $('#fld-interface-name').val()
            };

            if (formData.id === '') {
                $.post('http://localhost:3000/data/new', formData)
                    .done(function (data) {
                        if (data.success) {
                            table.ajax.reload();
                            $('#dlg-add-record').modal('hide');
                            clearFields();
                        } else {
                            $('#spinner').hide();
                            alert('ERROR: ' + JSON.stringify(data));
                        }
                    })
                    .fail(function (xhr, status, error) {
                        alert('ERROR: ' + JSON.stringify(error));
                    });
            } else {
                $.post('http://localhost:3000/data/' + formData.id, formData)
                    .done(function (data) {
                        if (data.success) {
                            table.ajax.reload();
                            $('#dlg-add-record').modal('hide');
                            clearFields();
                        } else {
                            $('#spinner').hide();
                            alert('ERROR: ' + JSON.stringify(data));
                        }
                    })
                    .fail(function (xhr, status, error) {
                        alert('ERROR: ' + JSON.stringify(error));
                    });
            }

        });

    }
}

function setFields(data) {
    $('#fld-id').val(data.ID);
    $('#fld-interface-id').val(data.InterfaceId);
    $('#fld-table-name').val(data.TableName);
    $('#fld-table-desc').val(data.TableDescription);
    $('#fld-subtype').val(data.Subtype);
    $('#fld-fld-name').val(data.FieldName);
    $('#fld-fld-desc').val(data.FieldDescription);
    $('#fld-data-type').val(data.DataType);
    $('#fld-length').val(data.Length);
    $('#fld-output-type').val(data.OutputType);
    $('#fld-output-length').val(data.OutputLength);
    $('#fld-notation').val(data.Notation);
    $('#fld-other-info').val(data.OtherInfo);
    $('#fld-interface-name').val(data.OtherInfo);
}

function clearFields() {
    $('#fld-id').val('');
    $('#fld-interface-id').val('');
    $('#fld-table-name').val('');
    $('#fld-table-desc').val('');
    $('#fld-subtype').val('');
    $('#fld-fld-name').val('');
    $('#fld-fld-desc').val('');
    $('#fld-data-type').val('');
    $('#fld-length').val(0);
    $('#fld-output-type').val('');
    $('#fld-output-length').val(0);
    $('#fld-notation').val('');
    $('#fld-other-info').val('');
    $('#fld-interface-name').val('');
}