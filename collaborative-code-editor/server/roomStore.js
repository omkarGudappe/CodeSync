
const Room = require('./models/Room');
const unsavedRooms = new Map();

function markUnsaved(roomId, timeoutId) {
    unsavedRooms.set(roomId, timeoutId);
}

function markSaved(roomId) {
    if (unsavedRooms.has(roomId)) {
        clearTimeout(unsavedRooms.get(roomId));
        unsavedRooms.delete(roomId);
    }
}

async function deleteRoom(roomId, io) {
    try {
        // First check if room is still unsaved
        const room = await Room.findOne({ roomId });
        
        if (!room) {
            console.log(`Room ${roomId} already deleted`);
            return;
        }
        
        if (room.isSaved) {
            console.log(`Room ${roomId} is saved - skipping deletion`);
            return;
        }

        // Only delete if still unsaved
        await Room.deleteOne({ roomId });
        console.log(`🧹 Room ${roomId} auto-deleted from database after timeout`);
        
        // Notify clients
        io.to(roomId).emit("room-deleted");
        
        // Clean up local state
        unsavedRooms.delete(roomId);
    } catch (err) {
        console.error(`❌ Error deleting room ${roomId}:`, err);
    }
}

function scheduleRoomDeletion(roomId, io) {
    const timeoutId = setTimeout(() => deleteRoom(roomId, io), 48 * 60 * 60 * 1000); 
    markUnsaved(roomId, timeoutId);
}

module.exports = { scheduleRoomDeletion, markSaved };