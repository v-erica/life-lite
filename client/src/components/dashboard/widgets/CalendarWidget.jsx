import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarWidget.css";

const parseDateValue = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toDateKey = (value) => {
  const d = parseDateValue(value);
  if (!d) return null;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};

export default function CalendarWidget({
  todoItems,
  eventItems,
  dashboardEvents,
  bills,
  birthdays,
}) {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const calendarIndicatorsByDate = useMemo(() => {
    const map = {};

    const add = (dateValue, type) => {
      const key = toDateKey(dateValue);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(type);
    };

    todoItems.forEach((t) => add(t.due_date, "todo"));
    (bills ?? []).forEach((b) => add(b.due_date ?? b.next_due_date, "bill"));

    const eventSource = eventItems.length > 0 ? eventItems : (dashboardEvents ?? []);
    eventSource.forEach((e) => add(e.event_date ?? e.date, "event"));

    (birthdays ?? []).forEach((b) => add(b.birthday ?? b.birth_date, "birthday"));

    return map;
  }, [todoItems, eventItems, dashboardEvents, bills, birthdays]);

  const renderCalendarTileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const key = toDateKey(date);
    const indicators = calendarIndicatorsByDate[key] ?? [];
    if (indicators.length === 0) return null;

    const visible = indicators.slice(0, 3);
    const overflow = indicators.length - visible.length;

    return (
      <div className="calendar-tile-indicators" aria-hidden="true">
        {visible.map((type, idx) => (
          <span
            key={`${type}-${idx}`}
            className={`calendar-tile-dot calendar-tile-dot-${type}`}
          />
        ))}
        {overflow > 0 ? (
          <span className="calendar-tile-overflow">...</span>
        ) : null}
      </div>
    );
  };

  return (
    <Calendar
      onChange={setCalendarDate}
      value={calendarDate}
      tileContent={renderCalendarTileContent}
    />
  );
}
