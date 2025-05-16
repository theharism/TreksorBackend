const getTimeRange = (rangeStr) => {
    const now = Math.floor(Date.now() / 1000);
    const days = parseInt(rangeStr.replace('d', '')) || 30;
    return {
        start: now - days * 24 * 60 * 60,
        end: now,
    };
};

module.exports = {getTimeRange};