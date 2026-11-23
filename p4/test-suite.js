/**
 * IIPS Connect - Automated Verification & Acceptance Test Suite
 * Tests all core application logic, reactive mutations, cross-feature state consistency,
 * and edge cases in a simulated browser environment.
 */

// Mock browser localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Mock DOM basics needed by utils/state
global.window = {
  location: { hash: "" },
  scrollTo: () => {}
};
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  documentElement: {
    getAttribute: () => "light",
    setAttribute: () => {}
  }
};

// Load modules in global context (simulating browser script tags)
const fs = require("fs");
const vm = require("vm");
vm.runInThisContext(fs.readFileSync("./js/data.js", "utf-8"));
vm.runInThisContext(fs.readFileSync("./js/state.js", "utf-8"));
vm.runInThisContext(fs.readFileSync("./js/utils.js", "utf-8"));

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log("\n==================================================");
console.log("🚀 RUNNING IIPS CONNECT AUTOMATED TEST SUITE");
console.log("==================================================\n");

// 1. Initial State Verification
console.log("Test Group 1: State Initialization & Default Records");
assert(store.state.students.length >= 8, `Initial students count >= 8 (Found: ${store.state.students.length})`);
assert(store.state.clubs.length >= 5, `Initial clubs count >= 5 (Found: ${store.state.clubs.length})`);
assert(store.state.posts.length >= 8, `Initial feed posts count >= 8 (Found: ${store.state.posts.length})`);
assert(store.state.recruitments.length >= 5, `Initial recruitments count >= 5 (Found: ${store.state.recruitments.length})`);
assert(store.state.events.length >= 5, `Initial events count >= 5 (Found: ${store.state.events.length})`);

const defaultUser = store.getCurrentUser();
assert(defaultUser && defaultUser.id === "student_1", `Default student is student_1 (Aarav Sharma)`);
const defaultRole = store.getCurrentRole();
assert(defaultRole === "student", `Default role is "student"`);

// 2. Role Switching Tests
console.log("\nTest Group 2: Role Switching & Club Context");
store.setRole("club_admin", "club_codelab");
assert(store.getCurrentRole() === "club_admin", `Role switched to club_admin`);
assert(store.getActiveClub().id === "club_codelab", `Active club is club_codelab`);

store.setActiveClub("club_ecell");
assert(store.getActiveClub().id === "club_ecell", `Active club changed to club_ecell`);

store.setRole("student");
assert(store.getCurrentRole() === "student", `Role switched back to student`);

// 3. Profile Updates
console.log("\nTest Group 3: Student Profile Updates & Consistency");
const updatedHeadline = "Staff Engineer & Distributed Systems Lead";
store.updateStudentProfile("student_1", { headline: updatedHeadline });
assert(store.getCurrentUser().headline === updatedHeadline, `Student headline updated`);

// Verify localStorage saved
const savedJson = JSON.parse(localStorage.getItem(store.STORAGE_KEY));
assert(savedJson.students.find(s => s.id === "student_1").headline === updatedHeadline, `Profile change persisted in localStorage`);

// 4. Social Feed Posts, Likes, Comments
console.log("\nTest Group 4: Social Feed Operations");
const initialPostsCount = store.state.posts.length;
const newPost = store.addPost({
  type: "project",
  title: "Automated Campus Testing Engine",
  content: "Built a fully reactive client-side test suite for IIPS Connect!",
  tags: ["Testing", "JavaScript", "DevTools"]
});
assert(newPost && newPost.id, `New post created with ID: ${newPost.id}`);
assert(store.state.posts.length === initialPostsCount + 1, `Post added to feed stream (Total: ${store.state.posts.length})`);
assert(newPost.authorId === "student_1", `Author is student_1`);

// Likes
const likeRes1 = store.toggleLikePost(newPost.id);
assert(likeRes1.liked === true && likeRes1.count === 1, `Student liked post (Count: 1)`);
const likeRes2 = store.toggleLikePost(newPost.id);
assert(likeRes2.liked === false && likeRes2.count === 0, `Student unliked post (Count: 0)`);

// Comments
const newComment = store.addComment(newPost.id, "Incredible work for IIPS DAVV!");
assert(newComment && newComment.id, `Comment added successfully`);
assert(newPost.comments.length === 1, `Post comments count is 1`);

// Filter test
const projectPosts = store.getPosts("projects");
assert(projectPosts.some(p => p.id === newPost.id), `Filter "projects" contains newly created project post`);

// Deletion
const deleteRes = store.deletePost(newPost.id);
assert(deleteRes === true, `Post owner deleted own post`);
assert(store.state.posts.length === initialPostsCount, `Post removed from store`);

// 5. Events Registration & Capacity
console.log("\nTest Group 5: Events Registration & Capacity Tracking");
const event = store.state.events[0];
const initialRegisteredCount = event.registeredStudentIds.length;
const isAlreadyReg = store.isRegisteredForEvent(event.id, "student_1");

// Toggle registration
const regRes1 = store.toggleEventRegistration(event.id);
assert(regRes1.success === true, `Event registration toggled`);
assert(regRes1.registered === !isAlreadyReg, `Registration state inverted`);

// Cancel registration back
const regRes2 = store.toggleEventRegistration(event.id);
assert(regRes2.success === true, `Event registration toggled back`);

// Club Admin Host Event
store.setRole("club_admin", "club_codelab");
const createdEvent = store.addEvent({
  title: "Indore AI Summit 2026",
  category: "Technology",
  date: "2026-11-20",
  venue: "Takshashila Auditorium",
  capacity: 150,
  description: "Exploring LLMs and multi-agent systems."
});
assert(createdEvent && createdEvent.id, `Club Admin created new event: ${createdEvent.title}`);
assert(store.state.events.some(e => e.id === createdEvent.id), `Event appears in events list`);
// Cross-feature check: Announcement post created in feed
assert(store.state.posts.some(p => p.title && p.title.includes("Indore AI Summit 2026")), `Event announcement auto-posted to social feed`);

store.setRole("student");

// 6. Recruitment & Application Lifecycle (CRITICAL CROSS-FEATURE TEST)
console.log("\nTest Group 6: Recruitment & Application Lifecycle");
const targetRecruitment = store.state.recruitments.find(r => r.clubId === "club_ecell" && r.status === "open");
assert(targetRecruitment !== undefined, `Found open recruitment for club_ecell`);

// Ensure student_1 has not applied yet
store.state.applications = store.state.applications.filter(a => !(a.studentId === "student_1" && a.recruitmentId === targetRecruitment.id));

const applyRes = store.applyToRecruitment(targetRecruitment.id, {
  motivation: "I have 3 years of web development experience and want to contribute to IIPS E-Cell platform.",
  skills: ["TypeScript", "Node.js", "React"],
  portfolioUrl: "https://aarav.dev",
  resumeFileName: "Aarav_Resume.pdf"
});
assert(applyRes.success === true, `Student applied to recruitment successfully`);
assert(applyRes.application.status === "pending", `Application status is initially "pending"`);

// Duplicate Prevention Test
const duplicateApplyRes = store.applyToRecruitment(targetRecruitment.id, {
  motivation: "Trying to apply a second time...",
  skills: ["JavaScript"]
});
assert(duplicateApplyRes.success === false, `Duplicate application correctly BLOCKED: "${duplicateApplyRes.message}"`);

// Cross-feature: Switch to Club Admin and Review Application
store.setRole("club_admin", "club_ecell");
const ecellClub = store.getActiveClub();
const prevMemberCount = ecellClub.memberCount || ecellClub.members.length;

// Find student_1's application
const studentApp = store.state.applications.find(a => a.studentId === "student_1" && a.recruitmentId === targetRecruitment.id);
assert(studentApp !== undefined, `Club admin can locate the student application`);

// Accept Application
const acceptRes = store.updateApplicationStatus(studentApp.id, "accepted", "Welcome aboard Aarav!");
assert(acceptRes.success === true, `Application accepted by Club Admin`);
assert(studentApp.status === "accepted", `Application status changed to "accepted"`);

// Cross-feature verification 1: Student added to club members roster
const isNowMember = ecellClub.members.some(m => m.studentId === "student_1");
assert(isNowMember === true, `Student automatically added to club member roster!`);
assert(ecellClub.memberCount === prevMemberCount + 1, `Club memberCount incremented`);

// Cross-feature verification 2: Club added to student's clubsJoined array
const studentRecord = store.state.students.find(s => s.id === "student_1");
assert(studentRecord.clubsJoined.includes("club_ecell"), `Club added to student's clubsJoined list`);

// Cross-feature verification 3: Notification created for student
const studentNotifs = store.state.notifications;
const acceptedNotif = studentNotifs.find(n => n.type === "application" && n.title.includes("Accepted"));
assert(acceptedNotif !== undefined, `Student received "Application Accepted" notification`);

// 7. Messaging
console.log("\nTest Group 7: Student to Club Messaging");
store.setRole("student");
const msgText = "What time does the Friday orientation meet?";
const sentMsg = store.sendMessage("club_codelab", "student_1", msgText, "student");
assert(sentMsg !== null, `Student sent message to club`);

const conv = store.getConversation("club_codelab", "student_1");
assert(conv.messages.some(m => m.text === msgText), `Message saved in conversation history`);
assert(conv.lastMessage === msgText, `Conversation lastMessage updated`);

// Club reply
const replyMsg = store.sendMessage("club_codelab", "student_1", "Orientation is at 4:30 PM in Lab 3.", "club");
assert(replyMsg !== null, `Club sent response to student`);
assert(conv.unreadCountStudent >= 1, `Student unread count incremented`);

store.markConversationRead(conv.id, "student");
assert(conv.unreadCountStudent === 0, `Conversation marked as read`);

// 8. Demo Reset
console.log("\nTest Group 8: Restore Default State");
store.resetToDefaults();
assert(store.state.students.length >= 8, `State restored to initial dataset`);
const restoredApp = store.state.applications.find(a => a.studentId === "student_1" && a.recruitmentId === targetRecruitment.id);
assert(!restoredApp, `Test application reset cleanly`);

console.log("\n==================================================");
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================\n");

if (failed > 0) {
  process.exit(1);
}
