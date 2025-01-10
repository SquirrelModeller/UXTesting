class DragManager {
    constructor(container, imageGroups) {
        this.container = container;
        this.imageGroups = imageGroups;
        this.isDragging = false;
        this.draggedElement = null;
        this.dragState = new Map();

        this.lastMousePos = {
            x: 0,
            y: 0
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.container.addEventListener('mousedown', this.handleMouseDown);
        this.container.addEventListener('mousemove', this.handleMouseMove);
        this.container.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('keypress', this.handleKeyPress);
    }

    getMousePosition(event) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleMouseDown(event) {
        const mousePos = this.getMousePosition(event);

        for (const group of this.imageGroups) {
            const infoImg = document.getElementById(group.infoImage.id);
            if (!infoImg || infoImg.style.opacity !== '1') continue;

            var bounds = {
                left: parseInt(infoImg.style.left),
                top: parseInt(infoImg.style.top),
                width: parseInt(infoImg.style.width),
                height: parseInt(infoImg.style.height)
            };

            if (this.isWithinBounds(mousePos, bounds)) {
                this.isDragging = true;
                this.draggedElement = infoImg;

                if (!this.dragState.has(infoImg.id)) {
                    this.dragState.set(infoImg.id, {
                        originalPosition: {
                            left: bounds.left,
                            top: bounds.top
                        }
                    })
                }
                let originalData = this.dragState.get(infoImg.id);

                this.dragState.set(infoImg.id, {
                    offset: {
                        x: mousePos.x - bounds.left,
                        y: mousePos.y - bounds.top
                    },
                    originalPosition: {
                        left: originalData.originalPosition.left,
                        top: originalData.originalPosition.top
                    }
                });

                infoImg.style.clipPath = `inset(0px 0px 0px ${group.infoImage.clipArea}px)`

                event.preventDefault();
                break;
            }
        }
    }

    handleMouseMove(event) {
        const rect = this.container.getBoundingClientRect();

        this.lastMousePos.x = event.clientX - rect.left;
        this.lastMousePos.y = event.clientY - rect.top;

        if (!this.isDragging || !this.draggedElement) return;

        const mousePos = this.getMousePosition(event);
        const dragData = this.dragState.get(this.draggedElement.id);

        if (dragData) {
            const newLeft = mousePos.x - dragData.offset.x;
            const newTop = mousePos.y - dragData.offset.y;

            this.draggedElement.style.left = `${newLeft}px`;
            this.draggedElement.style.top = `${newTop}px`;
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.draggedElement = null;
    }

    isWithinBounds(point, bounds) {
        return point.x >= bounds.left &&
            point.x < bounds.left + bounds.width &&
            point.y >= bounds.top &&
            point.y < bounds.top + bounds.height;
    }

    getElementAtPoint(point) {
        for (const group of this.imageGroups) {
            const infoImg = document.getElementById(group.infoImage.id);

            if (!infoImg || infoImg.style.opacity !== '1') continue;

            const bounds = {
                left: parseInt(infoImg.style.left),
                top: parseInt(infoImg.style.top),
                width: parseInt(infoImg.style.width),
                height: parseInt(infoImg.style.height)
            };


            if (this.isWithinBounds(point, bounds)) {
                return group;
            }
        }
        return null;
    }

    handleKeyPress(event) {
        if (event.code === "KeyT") {
            this.dragState.forEach((dragData, id) => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.left = `${dragData.originalPosition.left}px`;
                    element.style.top = `${dragData.originalPosition.top}px`;
                    element.style.clipPath = ""
                }
            });
            this.dragState.clear();
        }

        const targetElement = this.getElementAtPoint(this.lastMousePos);

        if (!targetElement) return;

        if (event.code === "KeyR") {
            const infoImg = document.getElementById(targetElement.infoImage.id);
            const dragData = this.dragState.get(infoImg.id);
            if (dragData) {
                infoImg.style.left = `${dragData.originalPosition.left}px`;
                infoImg.style.top = `${dragData.originalPosition.top}px`;
                infoImg.style.clipPath = ""
            }
        }
    }
}