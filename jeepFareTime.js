class jeepFareTime {
    constructor(distanceLength, speed) {
        this.distanceLength = distanceLength;
        this.regFare = 0;
        this.discFare = 0;
        this.timeHour = 0;
        this.speed = speed || 4; // default speed is 4 km/hr
        this.calculateFare();
    }

    calculateFare() {
        if (this.distanceLength <= 4) {
            this.regFare = 13;
            this.discFare = 11;
        } else {
            this.regFare = 13;
            this.discFare = 11;

            for (let i = 0; i < this.distanceLength; i += 4) {
                this.regFare += 2;
                this.discFare += 2;
            }
        }
    }

    calculateTime() {
        this.timeHour = this.distanceLength / this.speed;

        // convert hour to mins
        const hours = Math.floor(this.timeHour);
        const minutes = Math.round((this.timeHour % 1) * 60);
        this.finTime = hours + " hours and " + minutes + " minutes";
        return this.finTime;
    }
}
