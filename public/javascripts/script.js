console.log('sup world')

document.getElementById('groupsbutton').onclick = (e) => {
  document.getElementById('groupDropdown').classList.toggle('show')
}

document.getElementById('friendsbutton').onclick = (e) => {
  document.getElementById('friendsDropdown').classList.toggle('show')
}
document.getElementById('eventsbutton').onclick = (e) => {
  document.getElementById('eventsDropdown').classList.toggle('show')
}
document.getElementById('profilebutton').onclick = (e) => {
  document.getElementById('profileDropdown').classList.toggle('show')
}

