// socket.js
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  wasHost,
  isThereAHost,
  hasGameStarted,
  startGame,
} = require("./utils/users");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // joining a room
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      const len = getRoomUsers(user.room);
      if (len == 1) {
        socket.emit("userConnected", { type: "Host" });
      } else {
        if (hasGameStarted(user.room)) {
          socket.emit("gameHasAlreadyStarted");
        } else {
          socket.emit("userConnected", { type: "PC" });
        }

        io.to(user.room).emit("notifyHostConnection", user);
      }

      if (len > 1 && !isThereAHost(user.room)) {
        io.to(user.room).emit("HostDisconnected", user);
      }

      console.log(
        "Hi",
        user.username,
        "id:",
        user.id,
        "Room id:",
        user.room,
        "Connection number:",
        len
      );
    });

    socket.on("callWinFromPC", ({ callWinType, houses }) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("callWinToHost", { callWinType, houses, user });
        console.log(callWinType, "from", user.username, "in room:", user.room);
      } else {
        console.log("ISSUE: win call coming from null user");
      }
    });

    socket.on("resultsFromHost", ({ result, callWinType, userCalledForWin }) => {
      let user = getCurrentUser(socket.id);
      if (user) {
        const room = user.room;
        let calledWinUsername = userCalledForWin.username;
        console.log(
          result,
          "on",
          calledWinUsername,
          "for",
          callWinType,
          "in room:",
          room
        );
        io.to(room).emit("resultsForPC", {
          result,
          callWinType,
          calledWinUsername,
        });
      } else {
        console.log("ISSUE: results coming from null host");
      }
    });

    socket.on("newNumber", (num) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("newNumberFromHost", { newNumber: num });
        console.log("newNumberFromHost:", num, "in room:", user.room);
      } else {
        console.log("ISSUE: new number coming from null user");
      }
    });

    socket.on("HostConfigDone", (awards) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        console.log("HostConfigDone:", user.username);
        startGame(user.room);
        io.to(user.room).emit("HostConfigDone", awards);
      } else {
        console.log("ISSUE: Host Config attempted with null user");
      }
    });

    socket.on("PcReady", (numHouses) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("PcReady", user, numHouses);
      } else {
        console.log("ISSUE: PcReady coming from null user");
      }
    });

    socket.on("PcsStatus", (user, PcsStatus) => {
      console.log("readyPlayers", PcsStatus);
      if (user) {
        io.to(user.room).emit("PcsStatus", PcsStatus);
      }
    });

    socket.on("hostCompletedChecking", () => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("hostCompletedChecking");
      } else {
        console.log("ISSUE: hostCompletedChecking coming from null user");
      }
    });

    socket.on("showTimer", () => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("showTimer");
      } else {
        console.log("ISSUE: showTimer coming from null user");
      }
    });

    socket.on("disconnect", (reason) => {
      let user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("userDisconnect", user);
        if (wasHost(user)) {
          io.to(user.room).emit("HostDisconnected", user);
        }
      }
      user = userLeave(socket.id);
      console.log(
        "userDisconnected: ",
        user,
        "from room:",
        user ? user.room : null
      );
      console.log("reason:", reason);
    });
  });
};
