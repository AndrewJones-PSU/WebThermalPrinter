// A class for a simple linked-list queue

class queue {
	constructor() {
		this.head = null;
		this.tail = null;
		this.length = 0;
	}
	// add a value to the queue
	push(value) {
		if (this.head === null) {
			this.head = new queueNode(value);
			this.tail = this.head;
		} else {
			this.tail.next = new queueNode(value);
			this.tail = this.tail.next;
		}
		this.length++;
	}
	// remove and return the first value in the queue
	pop() {
		if (this.head === null) {
			return null;
		}
		let value = this.head.value;
		this.head = this.head.next;
		this.length--;
		return value;
	}
	// returns if the queue is empty
	isEmpty() {
		if (this.head === null) {
			return true;
		}
		return false;
	}
	// get the length of the queue
	getLength() {
		return this.length;
	}
}

// a node in the queue, holds a value and a pointer to the next node
class queueNode {
	constructor(value) {
		this.value = value;
		this.next = null;
	}
}

// export the queue class
module.exports = queue;
