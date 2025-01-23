import { createSlice } from "@reduxjs/toolkit";
import data from "../data/data.json";

// Helper function to load initial state from localStorage
const loadInitialState = () => {
  const savedState = localStorage.getItem("boards");
  return savedState ? JSON.parse(savedState) : data.boards;
};

// Helper function to persist state to localStorage
const persistState = (state) => {
  localStorage.setItem("boards", JSON.stringify(state));
};

const boardsSlice = createSlice({
  name: "boards",
  initialState: loadInitialState(),
  reducers: {
    addBoard: (state, action) => {
      const isActive = state.length > 0 ? false : true;
      const payload = action.payload;
      const board = {
        name: payload.name,
        isActive,
        columns: [],
      };
      board.columns = payload.newColumns;
      state.push(board);
      persistState(state); // Persist to localStorage
    },
    editBoard: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        board.name = payload.name;
        board.columns = payload.newColumns;
        persistState(state); // Persist to localStorage
      }
    },
    deleteBoard: (state) => {
      const board = state.find((board) => board.isActive);
      if (board) {
        state.splice(state.indexOf(board), 1);
        persistState(state); // Persist to localStorage
      }
    },
    setBoardActive: (state, action) => {
      state.forEach((board, index) => {
        board.isActive = index === action.payload.index;
      });
      persistState(state); // Persist to localStorage
    },
    addTask: (state, action) => {
      const { title, status, description, subtasks, newColIndex } =
        action.payload;
      const task = { title, description, subtasks, status };
      const board = state.find((board) => board.isActive);
      if (board) {
        const column = board.columns.find(
          (col, index) => index === newColIndex
        );
        if (column) {
          column.tasks.push(task);
          persistState(state); // Persist to localStorage
        }
      }
    },
    editTask: (state, action) => {
      const {
        title,
        status,
        description,
        subtasks,
        prevColIndex,
        newColIndex,
        taskIndex,
      } = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        const column = board.columns.find(
          (col, index) => index === prevColIndex
        );
        if (column) {
          const task = column.tasks.find((task, index) => index === taskIndex);
          if (task) {
            task.title = title;
            task.status = status;
            task.description = description;
            task.subtasks = subtasks;
            if (prevColIndex !== newColIndex) {
              column.tasks.splice(taskIndex, 1);
              const newCol = board.columns.find(
                (col, index) => index === newColIndex
              );
              if (newCol) {
                newCol.tasks.push(task);
              }
            }
            persistState(state); // Persist to localStorage
          }
        }
      }
    },
    dragTask: (state, action) => {
      const { colIndex, prevColIndex, taskIndex } = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        const prevCol = board.columns.find((col, i) => i === prevColIndex);
        if (prevCol) {
          const task = prevCol.tasks.splice(taskIndex, 1)[0];
          if (task) {
            board.columns.find((col, i) => i === colIndex).tasks.push(task);
            persistState(state);
          }
        }
      }
    },
    setSubtaskCompleted: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        const col = board.columns.find((col, i) => i === payload.colIndex);
        if (col) {
          const task = col.tasks.find((task, i) => i === payload.taskIndex);
          if (task) {
            const subtask = task.subtasks.find(
              (subtask, i) => i === payload.index
            );
            if (subtask) {
              subtask.isCompleted = !subtask.isCompleted;
              persistState(state);
            }
          }
        }
      }
    },
    setTaskStatus: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        const columns = board.columns;
        const col = columns.find((col, i) => i === payload.colIndex);
        if (col) {
          if (payload.colIndex === payload.newColIndex) return;
          const task = col.tasks.find((task, i) => i === payload.taskIndex);
          if (task) {
            task.status = payload.status;
            col.tasks = col.tasks.filter((task, i) => i !== payload.taskIndex);
            const newCol = columns.find((col, i) => i === payload.newColIndex);
            if (newCol) {
              newCol.tasks.push(task);
              persistState(state);
            }
          }
        }
      }
    },
    deleteTask: (state, action) => {
      const { colIndex, taskIndex } = action.payload;
      const board = state.find((board) => board.isActive);
      if (board) {
        const column = board.columns.find((col, i) => i === colIndex);
        if (column) {
          column.tasks.splice(taskIndex, 1);
          persistState(state); // Persist to localStorage
        }
      }
    },
  },
});

export default boardsSlice;
