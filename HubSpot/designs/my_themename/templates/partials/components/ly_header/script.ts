const $menu = $('.js_headerMenu')
const $button = $('.js_headerMenuBtn')
const $childMenu = $('.js_headerMenu_childMenu')
const $childButton = $('.js_headerMenu_childBtn')
const $overlay = $('.js_menuOverlay')
const $window = $(window)

// スマホメニュー開閉
$button.on('click', (event) => {
  const $target = $(event.currentTarget)
  $target.toggleClass('is_open')
  $overlay.toggleClass('is_show')
  $menu.toggleClass('is_show')
})

// スマホメニュー内accordion開閉
$childButton.on('click', (event) => {
  const $target = $(event.currentTarget)
  const winWidth = $(window).innerWidth()
  if (winWidth < 768) {
    event.preventDefault()
    const $next = $target.next('.js_headerMenu_childMenu')
    $target.toggleClass('is_open')
    $next.slideToggle(300)
  }
})

// PCビューで初期化
$window.on('resize load', () => {
  const winWidth = $(window).innerWidth()
  if (winWidth > 768) {
    initShowElement()
  }
})

function initShowElement() {
  $button.removeClass('is_open')
  $menu.removeClass('is_show')
  $childButton.removeClass('is_open')
  $childMenu.removeAttr('style')
  $overlay.removeClass('is_show')
}
