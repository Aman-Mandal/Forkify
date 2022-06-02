import { PreviewView } from './previewView.js'

class BookmarkView extends PreviewView {
  _parentEl = document.querySelector('.bookmarks__list')
  _errorMessage = `No Bookmarks yet. Find a nice recipe and bookmark it ;)`
  _successMessage = ''

  addHandlerRender(handler) {
    window.addEventListener('load', handler)
  }
}

export default new BookmarkView()
