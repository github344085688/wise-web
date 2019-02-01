/**
 * Created by colinc on 8/21/16.
 */

var appointmentPage = require('./appointment_page.js');
var appointment = new appointmentPage.searchCreateAppointment();

describe('appointment page', function () {
    // for (var i = 0; i <20; i++) {
        it('add appointment', function () {
            appointment.get();
            appointment.createAppointment();
        });
    // }
})