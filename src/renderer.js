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
        })
        .on('deselect.dt', function (e, dt, type, indexes) {
            selectedRecords.pop(table.rows(indexes).data().toArray()[0])
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
            if (data.success) {
                table.rows().deselect();
                selectedRecords = [];
                table.ajax.reload();
            } else {
                $('#spinner').hide();
                alert(data.message.message);
            }
        });

    });

    $('#btn-save').bind('click', function (e) {

        if (validateForm()) {
            e.preventDefault();
            return;
        }

        $('#spinner').show();
        var formData = {
            name: $('#fld-name').val(),
            position: $('#fld-name').val(),
            office: $('#fld-office').val(),
            extn: $('#fld-extn').val(),
            startDate: $('#fld-startdate').val(),
            salary: $('#fld-salary').val()
        };

        $.post('http://localhost:3000/data/new', formData, function (data) {
            if (data.success) {
                table.ajax.reload();
                $('#dlg-add-record').modal('hide');
            } else {
                $('#spinner').hide();
                alert('ERROR: ' + data.message.process.message);
            }
        });
    });

    function validateForm() {
        let validate = false;

        if ($('#fld-name').val().trim() === '') {
            $('#fld-name-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-name-help').hasClass('d-none')) {
                $('#fld-name-help').addClass('d-none');
            }
        }

        if ($('#fld-position').val().trim() === '') {
            $('#fld-position-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-position-help').hasClass('d-none')) {
                $('#fld-position-help').addClass('d-none');
            }
        }

        if ($('#fld-office').val().trim() === '') {
            $('#fld-office-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-office-help').hasClass('d-none')) {
                $('#fld-office-help').addClass('d-none');
            }
        }

        if ($('#fld-extn').val().trim() === '') {
            $('#fld-extn-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-extn-help').hasClass('d-none')) {
                $('#fld-extn-help').addClass('d-none');
            }
        }

        if ($('#fld-startdate').val().trim() === '') {
            $('#fld-startdate-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-startdate-help').hasClass('d-none')) {
                $('#fld-startdate-help').addClass('d-none');
            }
        }

        if ($('#fld-salary').val().trim() === '') {
            $('#fld-salary-help').removeClass('d-none');
            validate = true;
        } else {
            if (!$('#fld-salary-help').hasClass('d-none')) {
                $('#fld-salary-help').addClass('d-none');
            }
        }

        return validate;
    }

});