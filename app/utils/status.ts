export type Status = {
    id: string,
    name: string,
    src?: string,

    timeout?: number,
    stacks?: number,

    toString(): string,
}

export type PartialStatus = Omit<Status, 'id'> & { id?: string };

// export class Status {
//
//     stacks?: number;
//
//     addStacks(count = 1) {
//         this.stacks = (this.stacks || 0) + count;
//     }
// }

export function makeStatus(status: PartialStatus): Status {
    return {
        ...status,
        id: status.id || status.name,
        timeout: status.timeout ? parseNumber(status.timeout) : status.timeout,
        stacks: status.stacks ? parseNumber(status.stacks) : status.stacks,
        toString() { return this.id },
    };
}

export function addStacks(status: Status, count = 1) {
    status.stacks = (status.stacks || 0) + count;
}

export function removeStacks(status: Status, count = 1) {
    status.stacks = Math.max(0, (status.stacks || 0) - count);
}

export function clearStacks(status: Status) {
    status.stacks = 0;
}

export function getStatus(statusList: Status[], id: string) {
    const result = statusList.find(s => s.id === id);
    if (result) { return result; }
    return statusList.find(s => s.name === id);
}

export function addStatus(statusList: Status[], status: PartialStatus) {
    const resultStatus = makeStatus(status)
    return {
        status: resultStatus,
        list: [
            ...statusList.filter(s => s.id !== resultStatus.id),
            resultStatus,
        ]
    };
}

export function removeStatus(statusList: Status[], status: Status | string) {
    const id = typeof status === 'string' ? status : (status?.toString() || status.id || status.name);
    const statusResult = statusList.find(s => s.id === id)
    return {
        status: statusResult,
        list: statusList.filter(s => s.id !== id),
    };
}

export function getStatusSeconds(status: { timeout?: number }) {
    const timeout = status.timeout;
    if (!timeout || timeout <= 0) {
        return 0;
    }
    return Math.floor(timeout / 1000);
}
