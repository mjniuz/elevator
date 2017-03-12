/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 *
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 *
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 *
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 *
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

// Membuat fungsi array yang digunakan untuk memilih semua elemen yang lebih kecil dari parameter atFloor
Array.prototype.smaller = function (atFloor) {
    return this.filter(function (v) {
        return v <= atFloor;
    });
};

// Membuat fungsi array yang digunakan untuk memilih semua elemen yang lebih besar dari parameter atFloor
Array.prototype.greater = function (atFloor) {
    return this.filter(function (v) {
        return v >= atFloor;
    });
};

Elevator.prototype.decide = function() {
    var simulator = Simulator.get_instance();
    var building = simulator.get_building();
    var num_floors = building.get_num_floors();
    var elevators = Simulator.get_instance().get_building().get_elevator_system().get_elevators();
    var time_counter = simulator.get_time_counter();
    var requests = simulator.get_requests();

    var elevator    = this;
    var people      = this.get_people();

    if(elevator) {
        elevator.at_floor();
        elevator.get_destination_floor();
        elevator.get_position();
    }

    /*
     * Buat Sorting
     */
    function ascending(a, b) {
        return a - b;
    }

    function descending(a, b) {
        return b - a;
    }

    /*
     * Request semua lantai dan tujuan lantai setiap orang di elevator yang pada akhirnya akan di sorting berdasarkan tujuan elevator
     */
    var allReq = [];

    // Jika ada orang di elevator lalu simpan lantai tujuan yang pertama ke allReq
    for (var i = 0; i < people.length; i++) {
        allReq.push(people[i].get_destination_floor());
    }

    /*
     *  variable atFloor akan return undefined jika elevator mulai berjalan
     *  Jadi kita perlu mencari manual posisi saat ini dari elevator
     */
    var atFloor = (this.get_position() / this.get_height()) + 1;

    for(var i = 0;i < requests.length;i++) {
        var handled = false;

        for(var j = 0;j < elevators.length;j++) {
            if(elevators[j].get_destination_floor() == requests[i]) {
                handled = true;
                break;
            }
        }

        if(!handled) {
            allReq.push(requests[i]);
        }
    }

    var destinationFloor;
    // Perjalanan pertama dari elevator
    if (!this.direction) {
        // Mencari permintaan dari kedua tujuan
        var upperFloor = allReq.greater(atFloor);
        var lowerFloor = allReq.smaller(atFloor);

        // Set destinationFloor ke upperFloor jika upperFloor sama atau lebih besar dari lowerFloor, dan juka set lowerFloor
        destinationFloor = upperFloor >= lowerFloor ? upperFloor : lowerFloor;

        // set direction = keatas jika upperFloor sama atau lebih besar dari lowerFloor  dan set juga upperFloor
        this.direction = upperFloor >= lowerFloor ? Elevator.DIRECTION_UP : Elevator.DIRECTION_DOWN;
    } else {
        if(this.direction == Elevator.DIRECTION_UP){
            // mencari permintaan upper floor
            destinationFloor = allReq.greater(atFloor);

            // Jika tidak ada permintaan dari upper floor
            // lalu mencari permintaan dari lower floor
            if (destinationFloor.length == 0) {
                destinationFloor = allReq.smaller(atFloor);
                // set tujuan ke bawah
                this.direction = Elevator.DIRECTION_DOWN;
            }
        }

        if(this.direction == Elevator.DIRECTION_DOWN){
            // mencari permintaan dari lower floor
            destinationFloor = allReq.smaller(atFloor);

            // Jika tidak ada permintaan dari lower floor
            // lalu mencari permintaan dari upper floor
            if (destinationFloor.length == 0) {
                destinationFloor = allReq.greater(atFloor);
                // set tujuan ke atas
                this.direction = Elevator.DIRECTION_UP;
            }
        }
    }

    if (destinationFloor.length > 0) {
        // Sort destinationFloor berdasarkan tujuan
        var sort = this.direction == Elevator.DIRECTION_DOWN ? descending : ascending;
        destinationFloor.sort(sort);

        // memberi response kemana elevator akan pergi
        return this.commit_decision(destinationFloor[0]);
    }
};