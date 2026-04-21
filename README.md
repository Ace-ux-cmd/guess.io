# guess.io

## 1. Overview

This system is a real-time multiplayer number guessing game built on Node.js using Express and WebSocket. Players are matched into rooms based on selected difficulty and compete to guess a randomly generated secret number within a limited number of attempts.

The architecture is fully in-memory, event-driven, and optimized for low-latency communication between clients and server.

---

## 2. System Architecture

### 2.1 High-Level Design

The system is composed of four main layers:

1. **HTTP Layer (Express)**

   * Serves static client files
   * Handles basic routing

2. **WebSocket Layer (ws)**

   * Manages real-time bidirectional communication
   * Handles game events

3. **Game Logic Layer**

   * Room creation and lifecycle management
   * Guess evaluation logic
   * Win/loss determination

4. **State Layer (In-Memory Store)**

   * Stores active rooms
   * Tracks player-room relationships
   * Maintains matchmaking queues

---

## 3. Core Components

### 3.1 State Management

The system uses three primary in-memory structures:

* **rooms (Map)**
  Stores active game sessions.

* **playerRoom (Map)**
  Maps each player socket ID to their current room.

* **queues (Object of Arrays)**
  Handles matchmaking per difficulty level:

  * 2 players → easy
  * 3 players → medium
  * 4 players → hard

---

### 3.2 Room Structure

Each room contains:

* "roomId": Unique identifier
* "digit": Length of secret number
* "secret": Generated hidden number
* "status": "playing | finished"
* "attempt": Remaining guesses
* "players": Map of connected players
* "winner": Username of winner (if any)
* "lastGuess": Latest evaluated guess result

---

## 4. Game Flow

### 4.1 Connection Phase

1. Client connects via WebSocket
2. Server assigns a unique socket ID
3. Heartbeat system is initialized

---

### 4.2 Matchmaking Phase

Triggered by "play" event:

1. Player selects difficulty:

   * easy (2 players)
   * medium (3 players)
   * hard (4 players)

2. Player is added to corresponding queue

3. When queue is full:

   * A room is created
   * Secret number is generated
   * Players are assigned to room
   * Match notification is broadcast

---

### 4.3 Gameplay Phase

Triggered by "guess" event:

Each guess undergoes validation:

#### Validation Rules

* Must be numeric
* Must match secret digit length
* Must not contain duplicate digits

#### Evaluation Logic

For each digit:

* "correct" → correct digit and position
* "present" → digit exists but wrong position
* "absent" → digit not in secret

Additional metrics:

* "correctPosition": number of exact matches
* "correctDigit": number of valid digits present

---

### 4.4 Turn Handling

After evaluation:

* Attempt count decreases
* Last guess stored in room state
* Results broadcast:

  * Sender receives full evaluation
  * Other players receive only guess notification

---

### 4.5 Game Termination

Game ends when:

1. Player guesses the full number correctly
   OR
2. Attempts reach zero

Outcomes:

* Winner declared (if correct guess exists)
* Secret number revealed
* Room status set to "finished"
* All players notified via "game_over" event

---

## 5. WebSocket Event Specification

### 5.1 Client → Server

| Event   | Payload              | Description            |
| ------- | -------------------- | ---------------------- |
| "play"  | "{ username, mode }" | Join matchmaking queue |
| "guess" | "{ guess }"          | Submit number guess    |

---

### 5.2 Server → Client

| Event          | Payload         | Description             |
| -------------- | --------------- | ----------------------- |
| "match_found"  | room info       | Game started            |
| "match_failed" | error info      | Queue failure           |
| "guess_result" | evaluation      | Result for sender       |
| "guess_made"   | guess only      | Broadcast to others     |
| "game_over"    | winner + secret | Game ended              |
| "error"        | message         | Validation/system error |

---

## 6. Matchmaking System

### Behavior

* Players are grouped based on mode
* FIFO queue processing
* Automatic room creation when threshold is met

### Constraints

* No duplicate queue entries per player
* Players cannot join queue while in a room

---

## 7. Heartbeat System

Purpose: detect disconnected or inactive clients

### Mechanism:

* Server sends "ping" every 30 seconds
* Client responds with "pong"
* If no response:

  * Connection marked dead
  * Socket terminated

---

## 8. Disconnect Handling

On socket close:

* Player removed from all queues
* Removed from active room
* Room evaluated:

  * If only one player remains → declared winner
  * If empty → room deleted
* State cleanup performed:

  * "rooms"
  * "playerRoom"

---

## 9. Security & Validation

### Input Validation

* Strict numeric enforcement
* Duplicate digit detection
* Length enforcement

### Anti-Cheat Measures

* Server-side evaluation only
* No trust in client results

### Failure Handling

* JSON parsing errors handled safely
* Missing payloads rejected
* Invalid event types rejected

---

## 10. Configuration

### Game Modes

| Mode   | Players | Digits | Attempts |
| ------ | ------- | ------ | -------- |
| easy   | 2       | 4      | 10       |
| medium | 3       | 5      | 15       |
| hard   | 4       | 6      | 20       |

---

## 11. Limitations

* No persistent storage (in-memory only)
* No reconnection recovery
* No ranked system or matchmaking skill logic
* No horizontal scaling support

---

## 12. Extension Points

*Possible Updates:*

* Redis for distributed state management
* PostgreSQL or MongoDB for match history
* Authentication layer (JWT/session)
* Reconnection system
* Spectator mode
* Ranking and ELO system
* Rate limiting for anti-spam protection

---

## 13. Summary

This system implements a real-time multiplayer game using WebSocket with structured matchmaking, deterministic game rules, and strict server-side validation. It is designed primarily for learning real-time systems, state management, and event-driven architecture rather than production-scale deployment.
