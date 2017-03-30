var TimeKeeper = (function () {
    function TimeKeeper(limit) {
        this._origin = Date.now();
        this._pausedTime = 0;
        this._limit = limit || Infinity;
        this._rate = 1;
        this._offset = 0;
    }
    TimeKeeper.prototype.now = function () {
        var time = (this.isPausing()) ? this._pausedTime : ((Date.now() - this._origin) * this._rate + this._offset);
        return Math.min(time, this._limit);
    };
    ;
    TimeKeeper.prototype.setTime = function (time) {
        if (this.isPausing()) {
            this._pausedTime = time;
        }
        else {
            this._origin = Date.now();
            this._offset = time;
        }
    };
    ;
    TimeKeeper.prototype.isPausing = function () {
        return this._pausedTime != null;
    };
    ;
    TimeKeeper.prototype.start = function () {
        if (!this.isPausing())
            return;
        this._origin = Date.now();
        this._offset = this._pausedTime;
        this._pausedTime = null;
    };
    ;
    TimeKeeper.prototype.pause = function () {
        if (this.isPausing())
            return;
        this._pausedTime = this.now();
    };
    ;
    TimeKeeper.prototype.getRate = function () {
        return this._rate;
    };
    TimeKeeper.prototype.setRate = function (rate) {
        if (this._rate === rate)
            return;
        this.setTime(this.now());
        this._rate = rate;
    };
    ;
    return TimeKeeper;
}());
