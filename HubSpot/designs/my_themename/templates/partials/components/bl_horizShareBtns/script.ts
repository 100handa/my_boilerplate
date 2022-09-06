function shareButton() {
  const $button = $('.js_shareBtn'),
    width = 550,
    height = 450

  $button.on('click', function (event) {
    event.preventDefault()

    const $this = $(this),
      thisHref = $this.attr('href'),
      thisSNS = $this.data('sns'),
      x = (screen.width - width) / 2,
      y = (screen.height - height) / 2,
      windowArg =
        'screenX=' +
        x +
        ', screenY=' +
        y +
        ', left=' +
        x +
        ', top=' +
        y +
        ', width=' +
        width +
        ', height=' +
        height +
        ', personalbar=0, toolbar=0, scrollbars=1, resizable=1'

    window.open(thisHref, thisSNS, windowArg)
  })
}

$(function () {
  shareButton()
})
