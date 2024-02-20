class SessionStat {
    private _totalRequestAmount = 0;
    private _answeredRequestAmount = 0;
    private _failedRequestAmount = 0;

    increaseTotalRequestAmount() {
        this._totalRequestAmount += 1;
    }

    increaseAnsweredRequestAmount() {
        this._answeredRequestAmount += 1;
    }

    increaseFailedRequestAmount() {
        this._failedRequestAmount += 1;
    }

    get totalRequestAmount() {
        return this._totalRequestAmount;
    }

    get answeredRequestAmount() {
        return this._answeredRequestAmount;
    }

    get failedRequestAmount() {
        return this._failedRequestAmount;
    }
}

export const stat = new SessionStat();