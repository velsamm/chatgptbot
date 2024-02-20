class SessionStat {
    private _totalRequestAmount = 0;
    private _answeredRequestAmount = 0;
    private _failedRequestAmount = 0;

    private _requestMap = new Map<number, number>();

    increaseTotalRequestAmount() {
        this._totalRequestAmount += 1;
    }

    increaseAnsweredRequestAmount() {
        this._answeredRequestAmount += 1;
    }

    increaseFailedRequestAmount() {
        this._failedRequestAmount += 1;
    }

    increaseRequestMapCounter(telegramId: number) {
        const oldValue = this._requestMap.get(telegramId) ?? 0
        this._requestMap.set(telegramId, oldValue + 1)
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

    get requestMap() {
        return this._requestMap;
    }
}

export const stat = new SessionStat();