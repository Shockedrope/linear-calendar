class LinearCalendar {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.categories = this.loadCategories();
        this.events = this.loadEvents();
        this.editingEventId = null;
        this.editingCategoryId = null;
        this.alignByWeekday = true; // true = align by weekday, false = align by first day
        this.init();
    }

    init() {
        this.migrateOldEvents();
        this.renderCalendar();
        this.renderEventsList();
        this.renderCategoriesList();
        this.updateCategoryPresets();
        this.setupEventListeners();
        document.getElementById('currentYear').textContent = this.currentYear;
    }

    migrateOldEvents() {
        let needsSave = false;
        this.events.forEach(event => {
            if (!event.categoryId && event.color) {
                // Try to find matching category by color
                const category = this.getCategoryByColor(event.color);
                if (category) {
                    event.categoryId = category.id;
                    needsSave = true;
                }
            }
        });
        if (needsSave) {
            this.saveToLocalStorage();
        }
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

        // Category modal listeners
        const categoryModal = document.getElementById('categoryModal');
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const categoryCloseBtn = document.querySelector('.category-close');
        const categoryCancelBtn = document.querySelector('.category-cancel-btn');
        const categoryForm = document.getElementById('categoryForm');
        const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                document.getElementById('categoriesPanel').style.display =
                    document.getElementById('categoriesPanel').style.display === 'none' ? 'block' : 'none';
            });
        }

        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.openCategoryModal());
        }

        if (categoryCloseBtn) {
            categoryCloseBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        if (categoryCancelBtn) {
            categoryCancelBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCategory();
            });
        }

        if (deleteCategoryBtn) {
            deleteCategoryBtn.addEventListener('click', () => this.deleteCategory());
        }

        if (categoryModal) {
            window.addEventListener('click', (e) => {
                if (e.target === categoryModal) {
                    this.closeCategoryModal();
                }
            });
        }

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

        // Sync end date with start date
        const startDateInput = document.getElementById('eventStartDate');
        const endDateInput = document.getElementById('eventEndDate');
        startDateInput.addEventListener('change', () => {
            if (!endDateInput.value || endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });

        // Custom color picker - clear categoryId when manually changed
        const colorPicker = document.getElementById('eventColor');
        if (colorPicker) {
            colorPicker.addEventListener('input', () => {
                // Deselect all preset buttons
                document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
                // Clear categoryId when using custom color
                document.getElementById('eventCategoryId').value = '';
            });
        }
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
            document.getElementById('eventCategoryId').value = event.categoryId || '';
            deleteBtn.style.display = 'block';

            // Highlight the matching category preset
            document.querySelectorAll('.color-preset').forEach(btn => {
                if (event.categoryId && btn.dataset.categoryId === event.categoryId) {
                    btn.classList.add('active');
                } else if (!event.categoryId && btn.dataset.color === event.color) {
                    btn.classList.add('active');
                }
            });
        } else {
            this.editingEventId = null;
            modalTitle.textContent = 'Add Event';
            document.getElementById('eventForm').reset();
            const defaultCategory = this.categories[0];
            if (defaultCategory) {
                document.getElementById('eventColor').value = defaultCategory.color;
                document.getElementById('eventCategoryId').value = defaultCategory.id;
            } else {
                document.getElementById('eventColor').value = '#4CAF50';
                document.getElementById('eventCategoryId').value = '';
            }
            if (prefilledDate) {
                document.getElementById('eventStartDate').value = prefilledDate;
                document.getElementById('eventEndDate').value = prefilledDate;
            }
            deleteBtn.style.display = 'none';

            // Set default active preset
            const firstPreset = document.querySelector('.color-preset');
            if (firstPreset) {
                firstPreset.classList.add('active');
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
        const categoryId = document.getElementById('eventCategoryId').value;

        if (this.editingEventId) {
            const eventIndex = this.events.findIndex(e => e.id === this.editingEventId);
            if (eventIndex !== -1) {
                this.events[eventIndex] = {
                    id: this.editingEventId,
                    title,
                    startDate,
                    endDate,
                    color,
                    categoryId: categoryId || null,
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
                categoryId: categoryId || null,
                description
            };
            this.events.push(newEvent);
        }

        this.saveToLocalStorage();
        this.renderCalendar();
        this.renderEventsList();
        this.renderCategoriesList();
        this.closeModal();
    }

    deleteEvent() {
        if (this.editingEventId && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== this.editingEventId);
            this.saveToLocalStorage();
            this.renderCalendar();
            this.renderEventsList();
            this.renderCategoriesList();
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

    loadCategories() {
        const stored = localStorage.getItem('linearCalendarCategories');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default categories
        return [
            { id: '1', name: 'Personal', color: '#4CAF50' },
            { id: '2', name: 'Work', color: '#2196F3' },
            { id: '3', name: 'Important', color: '#FF9800' },
            { id: '4', name: 'Family', color: '#9C27B0' },
            { id: '5', name: 'Urgent', color: '#F44336' },
            { id: '6', name: 'Event', color: '#00BCD4' }
        ];
    }

    saveCategories() {
        localStorage.setItem('linearCalendarCategories', JSON.stringify(this.categories));
    }

    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id);
    }

    getCategoryByColor(color) {
        return this.categories.find(cat => cat.color === color);
    }

    openCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('categoryModalTitle');
        const deleteBtn = document.getElementById('deleteCategoryBtn');

        if (category) {
            this.editingCategoryId = category.id;
            modalTitle.textContent = 'Edit Category';
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryColor').value = category.color;
            deleteBtn.style.display = 'block';
        } else {
            this.editingCategoryId = null;
            modalTitle.textContent = 'Add Category';
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryColor').value = '#' + Math.floor(Math.random()*16777215).toString(16);
            deleteBtn.style.display = 'none';
        }

        modal.style.display = 'block';
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.style.display = 'none';
        document.getElementById('categoryForm').reset();
        this.editingCategoryId = null;
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const color = document.getElementById('categoryColor').value;

        if (!name) {
            alert('Category name is required');
            return;
        }

        if (this.editingCategoryId) {
            const categoryIndex = this.categories.findIndex(c => c.id === this.editingCategoryId);
            if (categoryIndex !== -1) {
                const oldColor = this.categories[categoryIndex].color;
                this.categories[categoryIndex] = {
                    id: this.editingCategoryId,
                    name,
                    color
                };
                // Update events that use this category
                this.events.forEach(event => {
                    if (event.categoryId === this.editingCategoryId) {
                        event.color = color;
                    } else if (event.color === oldColor && !event.categoryId) {
                        // Migrate old events that match the color
                        event.categoryId = this.editingCategoryId;
                        event.color = color;
                    }
                });
                this.saveToLocalStorage();
            }
        } else {
            const newCategory = {
                id: Date.now().toString(),
                name,
                color
            };
            this.categories.push(newCategory);
        }

        this.saveCategories();
        this.renderCategoriesList();
        this.updateCategoryPresets();
        this.renderCalendar();
        this.renderEventsList();
        this.closeCategoryModal();
    }

    deleteCategory() {
        if (!this.editingCategoryId) return;

        const eventsUsingCategory = this.events.filter(e => e.categoryId === this.editingCategoryId);

        if (eventsUsingCategory.length > 0) {
            const confirmMsg = `This category is used by ${eventsUsingCategory.length} event(s). Deleting it will remove the category from those events. Continue?`;
            if (!confirm(confirmMsg)) return;

            // Remove category from events
            this.events.forEach(event => {
                if (event.categoryId === this.editingCategoryId) {
                    event.categoryId = null;
                }
            });
            this.saveToLocalStorage();
        } else {
            if (!confirm('Are you sure you want to delete this category?')) return;
        }

        this.categories = this.categories.filter(c => c.id !== this.editingCategoryId);
        this.saveCategories();
        this.renderCategoriesList();
        this.updateCategoryPresets();
        this.renderCalendar();
        this.renderEventsList();
        this.closeCategoryModal();
    }

    renderCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        if (this.categories.length === 0) {
            categoriesList.innerHTML = '<div class="empty-state">No categories. Click "Add Category" to create one!</div>';
            return;
        }

        categoriesList.innerHTML = '';
        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.style.borderLeftColor = category.color;

            const colorDot = document.createElement('div');
            colorDot.className = 'category-color-dot';
            colorDot.style.backgroundColor = category.color;

            const name = document.createElement('div');
            name.className = 'category-item-name';
            name.textContent = category.name;

            const eventsCount = this.events.filter(e => e.categoryId === category.id).length;
            const count = document.createElement('div');
            count.className = 'category-item-count';
            count.textContent = `${eventsCount} event${eventsCount !== 1 ? 's' : ''}`;

            categoryItem.appendChild(colorDot);
            categoryItem.appendChild(name);
            categoryItem.appendChild(count);

            categoryItem.addEventListener('click', () => this.openCategoryModal(category));

            categoriesList.appendChild(categoryItem);
        });
    }

    updateCategoryPresets() {
        const presetsContainer = document.querySelector('.color-presets');
        if (!presetsContainer) return;

        presetsContainer.innerHTML = '';
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'color-preset';
            button.dataset.color = category.color;
            button.dataset.categoryId = category.id;
            button.style.background = category.color;
            button.textContent = category.name;

            button.addEventListener('click', () => {
                document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                document.getElementById('eventColor').value = category.color;
                document.getElementById('eventCategoryId').value = category.id;
            });

            presetsContainer.appendChild(button);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LinearCalendar();
});
