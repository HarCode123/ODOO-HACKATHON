// Generates short ids like the frontend's uid('a') -> 'a3f9k2'
function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

module.exports = uid;
