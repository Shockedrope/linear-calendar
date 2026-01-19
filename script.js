class LinearCalendar {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.events = this.loadEvents();
        this.editingEventId = null;
        this.alignByWeekday = true; // true = align by weekday, false = align by first day
        this.init();
    }

    init() {
        this.renderCalendar();
        this.renderEventsList();
        this.setupEventListeners();
        document.getElementById('currentYear').textContent = this.currentYear;
    }

    setupEventListeners() {
        const modal = document.getElementById('eventModal');
        const addBtn = document.getElementById('addEventBtn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.querySelector('.cancel-btn');
        const form = document.getElementById('eventForm');
        const prevYearBtn = document.getElementById('prevYear');
        const nextYearBtn = document.getElementById('nextYear');
        const deleteBtn = document.getElementById('deleteEventBtn');

        addBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        deleteBtn.addEventListener('click', () => this.deleteEvent());

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        prevYearBtn.addEventListener('click', () => {
            this.currentYear--;
            this.updateYear();
        });

        nextYearBtn.addEventListener('click', () => {
            this.currentYear++;
            this.updateYear();
        });

        // View mode buttons
        const alignByWeekdayBtn = document.getElementById('alignByWeekday');
        const alignByFirstDayBtn = document.getElementById('alignByFirstDay');

        alignByWeekdayBtn.addEventListener('click', () => {
            this.alignByWeekday = true;
            alignByWeekdayBtn.classList.add('active');
            alignByFirstDayBtn.classList.remove('active');
            this.renderCalendar();
        });

        alignByFirstDayBtn.addEventListener('click', () => {
            this.alignByWeekday = false;
            alignByWeekdayBtn.classList.remove('active');
            alignByFirstDayBtn.classList.add('active');
            this.renderCalendar();
        });

        // Color preset buttons
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('eventColor').value = btn.dataset.color;
            });
        });

        // Sync end date with start date
        const startDateInput = document.getElementById('eventStartDate');
        const endDateInput = document.getElementById('eventEndDate');
        startDateInput.addEventListener('change', () => {
            if (!endDateInput.value || endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });
    }

    renderCalendar() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();

        months.forEach((month, monthIndex) => {
            const monthRow = document.createElement('div');
            monthRow.className = 'month-row';

            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-header';
            monthHeader.textContent = month;

            const daysGrid = document.createElement('div');
            daysGrid.className = 'days-grid';

            const daysInMonth = new Date(this.currentYear, monthIndex + 1, 0).getDate();
            const firstDay = new Date(this.currentYear, monthIndex, 1).getDay();

            if (this.alignByWeekday) {
                // Align by weekday - add empty cells for days before the month starts
                for (let i = 0; i < firstDay; i++) {
                    const emptyCell = document.createElement('div');
                    emptyCell.className = 'day-cell empty';
                    daysGrid.appendChild(emptyCell);
                }
            }

            // Add cells for each day in the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                dayCell.dataset.day = day;
                dayCell.dataset.month = monthIndex;
                dayCell.dataset.year = this.currentYear;

                const currentDate = new Date(this.currentYear, monthIndex, day);
                const isToday = currentDate.toDateString() === today.toDateString();
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                if (isToday) {
                    dayCell.classList.add('today');
                }

                if (isWeekend) {
                    dayCell.classList.add('weekend');
                }

                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;

                dayCell.appendChild(dayNumber);

                dayCell.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('event-marker')) {
                        const dateStr = `${this.currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        this.openModal(null, dateStr);
                    }
                });

                daysGrid.appendChild(dayCell);
            }

            // Add trailing empty cells to ensure all months have 37 total cells
            const currentCells = daysGrid.children.length;
            const totalCells = 37; // Max possible (6 empty start + 31 days)
            for (let i = currentCells; i < totalCells; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'day-cell empty';
                daysGrid.appendChild(emptyCell);
            }

            monthRow.appendChild(monthHeader);
            monthRow.appendChild(daysGrid);
            timeline.appendChild(monthRow);

            // Render events for this month after grid is built
            this.renderMonthEvents(daysGrid, monthIndex);
        });
    }

    renderMonthEvents(daysGrid, monthIndex) {
        const monthEvents = this.events.filter(event => {
            const startDate = this.parseLocalDate(event.startDate);
            const endDate = this.parseLocalDate(event.endDate);
            const monthStart = new Date(this.currentYear, monthIndex, 1);
            const monthEnd = new Date(this.currentYear, monthIndex + 1, 0);

            return (startDate <= monthEnd && endDate >= monthStart);
        });

        // Sort events by start date, then by duration (longer first)
        monthEvents.sort((a, b) => {
            const aStart = this.parseLocalDate(a.startDate);
            const bStart = this.parseLocalDate(b.startDate);
            if (aStart.getTime() !== bStart.getTime()) {
                return aStart - bStart;
            }
            const aEnd = this.parseLocalDate(a.endDate);
            const bEnd = this.parseLocalDate(b.endDate);
            return bEnd - aEnd; // Longer events first
        });

        // Track which rows are occupied by which column ranges
        const rows = [];

        monthEvents.forEach((event) => {
            const startDate = this.parseLocalDate(event.startDate);
            const endDate = this.parseLocalDate(event.endDate);

            const monthStart = new Date(this.currentYear, monthIndex, 1);
            const monthEnd = new Date(this.currentYear, monthIndex + 1, 0);

            const displayStart = startDate < monthStart ? monthStart : startDate;
            const displayEnd = endDate > monthEnd ? monthEnd : endDate;

            const startDay = displayStart.getDate();
            const endDay = displayEnd.getDate();

            // Find the grid column for the start day
            let startCol = 0;
            const dayCells = Array.from(daysGrid.children);
            for (let i = 0; i < dayCells.length; i++) {
                const cell = dayCells[i];
                if (cell.dataset.day == startDay) {
                    startCol = i + 1; // CSS grid columns are 1-indexed
                    break;
                }
            }

            if (startCol > 0) {
                const spanDays = endDay - startDay + 1;
                const endCol = startCol + spanDays - 1;

                // Find the first available row for this event
                let rowIndex = 0;
                let foundRow = false;

                for (let r = 0; r < rows.length; r++) {
                    let canFit = true;
                    for (let col = startCol; col <= endCol; col++) {
                        if (rows[r][col]) {
                            canFit = false;
                            break;
                        }
                    }
                    if (canFit) {
                        rowIndex = r;
                        foundRow = true;
                        break;
                    }
                }

                // If no row found, create a new one
                if (!foundRow) {
                    rowIndex = rows.length;
                    rows.push({});
                }

                // Mark columns as occupied in this row
                for (let col = startCol; col <= endCol; col++) {
                    rows[rowIndex][col] = true;
                }

                const eventMarker = document.createElement('div');
                eventMarker.className = 'event-marker';
                eventMarker.style.backgroundColor = event.color;
                eventMarker.style.gridColumn = `${startCol} / span ${spanDays}`;
                eventMarker.style.top = `${20 + rowIndex * 18}px`;
                eventMarker.textContent = event.title;

                eventMarker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openModal(event);
                });

                daysGrid.appendChild(eventMarker);
            }
        });
    }

    createEventMarker(event) {
        const marker = document.createElement('div');
        marker.className = 'event-marker';
        marker.style.backgroundColor = event.color;

        const title = document.createElement('div');
        title.className = 'event-marker-title';
        title.textContent = event.title;

        marker.appendChild(title);

        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(event);
        });

        return marker;
    }

    getEventsByDate(year, month, day) {
        return this.events.filter(event => {
            const currentDate = new Date(year, month, day);
            const startDate = this.parseLocalDate(event.startDate);
            const endDate = this.parseLocalDate(event.endDate);

            return currentDate >= startDate && currentDate <= endDate;
        }).sort((a, b) => this.parseLocalDate(a.startDate) - this.parseLocalDate(b.startDate));
    }

    renderEventsList() {
        const eventsList = document.getElementById('eventsList');

        const upcomingEvents = this.events
            .filter(event => {
                const eventEndDate = this.parseLocalDate(event.endDate);
                return eventEndDate >= new Date() || eventEndDate.getFullYear() === this.currentYear;
            })
            .sort((a, b) => this.parseLocalDate(a.startDate) - this.parseLocalDate(b.startDate));

        if (upcomingEvents.length === 0) {
            eventsList.innerHTML = '<div class="empty-state">No upcoming events. Click "Add Event" to create one!</div>';
            return;
        }

        eventsList.innerHTML = '';
        upcomingEvents.forEach(event => {
            const eventItem = this.createEventListItem(event);
            eventsList.appendChild(eventItem);
        });
    }

    createEventListItem(event) {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.style.borderLeftColor = event.color;

        const title = document.createElement('div');
        title.className = 'event-item-title';
        title.textContent = event.title;

        const date = document.createElement('div');
        date.className = 'event-item-date';
        const startDate = this.parseLocalDate(event.startDate);
        const endDate = this.parseLocalDate(event.endDate);
        if (event.startDate === event.endDate) {
            date.textContent = this.formatDate(startDate);
        } else {
            date.textContent = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
        }

        item.appendChild(title);
        item.appendChild(date);

        if (event.description) {
            const description = document.createElement('div');
            description.className = 'event-item-description';
            description.textContent = event.description;
            item.appendChild(description);
        }

        item.addEventListener('click', () => this.openModal(event));

        return item;
    }

    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    parseLocalDate(dateString) {
        // Parse date string as local date to avoid timezone issues
        // Input format: "YYYY-MM-DD"
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    openModal(event = null, prefilledDate = null) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteEventBtn');

        // Clear active state on color presets
        document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));

        if (event) {
            this.editingEventId = event.id;
            modalTitle.textContent = 'Edit Event';
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventStartDate').value = event.startDate;
            document.getElementById('eventEndDate').value = event.endDate;
            document.getElementById('eventColor').value = event.color;
            document.getElementById('eventDescription').value = event.description || '';
            deleteBtn.style.display = 'block';

            // Highlight the matching color preset
            document.querySelectorAll('.color-preset').forEach(btn => {
                if (btn.dataset.color === event.color) {
                    btn.classList.add('active');
                }
            });
        } else {
            this.editingEventId = null;
            modalTitle.textContent = 'Add Event';
            document.getElementById('eventForm').reset();
            document.getElementById('eventColor').value = '#4CAF50';
            if (prefilledDate) {
                document.getElementById('eventStartDate').value = prefilledDate;
                document.getElementById('eventEndDate').value = prefilledDate;
            }
            deleteBtn.style.display = 'none';

            // Set default active preset (Personal)
            const defaultPreset = document.querySelector('.color-preset[data-color="#4CAF50"]');
            if (defaultPreset) {
                defaultPreset.classList.add('active');
            }
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        modal.style.display = 'none';
        document.getElementById('eventForm').reset();
        document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
        this.editingEventId = null;
    }

    saveEvent() {
        const title = document.getElementById('eventTitle').value;
        const startDate = document.getElementById('eventStartDate').value;
        const endDate = document.getElementById('eventEndDate').value;
        const color = document.getElementById('eventColor').value;
        const description = document.getElementById('eventDescription').value;

        if (this.editingEventId) {
            const eventIndex = this.events.findIndex(e => e.id === this.editingEventId);
            if (eventIndex !== -1) {
                this.events[eventIndex] = {
                    id: this.editingEventId,
                    title,
                    startDate,
                    endDate,
                    color,
                    description
                };
            }
        } else {
            const newEvent = {
                id: Date.now().toString(),
                title,
                startDate,
                endDate,
                color,
                description
            };
            this.events.push(newEvent);
        }

        this.saveToLocalStorage();
        this.renderCalendar();
        this.renderEventsList();
        this.closeModal();
    }

    deleteEvent() {
        if (this.editingEventId && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== this.editingEventId);
            this.saveToLocalStorage();
            this.renderCalendar();
            this.renderEventsList();
            this.closeModal();
        }
    }

    updateYear() {
        document.getElementById('currentYear').textContent = this.currentYear;
        this.renderCalendar();
        this.renderEventsList();
    }

    saveToLocalStorage() {
        localStorage.setItem('linearCalendarEvents', JSON.stringify(this.events));
    }

    loadEvents() {
        const stored = localStorage.getItem('linearCalendarEvents');
        return stored ? JSON.parse(stored) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LinearCalendar();
});
