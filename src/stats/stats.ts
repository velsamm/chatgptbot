class SessionStat {
    private _totalRequestAmount = 0;
    private _answeredRequestAmount = 0;

    increaseTotalRequestAmount() {
        this._totalRequestAmount += 1;
    }

    increaseAnsweredRequestAmount() {
        this._answeredRequestAmount += 1;
    }

    get totalRequestAmount() {
        return this._totalRequestAmount;
    }

    get answeredRequestAmount() {
        return this._answeredRequestAmount;
    }
}

export const stat = new SessionStat();