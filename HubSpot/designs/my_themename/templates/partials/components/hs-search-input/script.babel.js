(function () {
  const selectors = {
    wrapper: 'hs-search-field',
    input: 'hs-search-field__input',
    suggestions: 'hs-search-field__suggestions',
    open: 'hs-search-field--open',
  };

  const hsSearch = function (_instance) {
    const TYPEAHEAD_LIMIT = 3;
    const KEYS = {
      TAB: 'Tab',
      ESC: 'Esc', // IE11 & Edge 16 value for Escape
      ESCAPE: 'Escape',
      UP: 'Up', // IE11 & Edge 16 value for Arrow Up
      ARROW_UP: 'ArrowUp',
      DOWN: 'Down', // IE11 & Edge 16 value for Arrow Down
      ARROW_DOWN: 'ArrowDown',
    };

    let searchTerm = '';
    const searchForm = _instance;
    const searchField = _instance.querySelector(`.${selectors.input}`);
    const searchResults = _instance.querySelector(`.${selectors.suggestions}`);
    const searchOptions = function () {
      const formParams = [];
      const form = _instance.querySelector('form');
      for (
        let i = 0;
        i < form.querySelectorAll('input[type=hidden]').length;
        i++
      ) {
        const e = form.querySelectorAll('input[type=hidden]')[i];
        if (e.name !== 'limit') {
          formParams.push(
            encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value)
          );
        }
      }
      return formParams.join('&');
    };

    const debounce = function (func, wait, immediate) {
        let timeout;
        return function () {
          const context = this,
            args = arguments;
          const later = function () {
            timeout = null;
            if (!immediate) {
              func.apply(context, args);
            }
          };
          const callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait || 200);
          if (callNow) {
            func.apply(context, args);
          }
        };
      },
      emptySearchResults = function () {
        searchResults.innerHTML = '';
        searchField.focus();
        searchForm.classList.remove(selectors.open);
      },
      fillSearchResults = function (response) {
        const items = [];
        items.push(
          "<li id='results-for'>Results for \"" + response.searchTerm + '"</li>'
        );
        response.results.forEach(function (val, index) {
          items.push(
            "<li id='result" +
              index +
              "'><a href='" +
              val.url +
              "'>" +
              val.title +
              '</a></li>'
          );
        });

        emptySearchResults();
        searchResults.innerHTML = items.join('');
        searchForm.classList.add(selectors.open);
      },
      trapFocus = function () {
        const tabbable = [];
        tabbable.push(searchField);
        const tabbables = searchResults.getElementsByTagName('A');
        for (let i = 0; i < tabbables.length; i++) {
          tabbable.push(tabbables[i]);
        }
        const firstTabbable = tabbable[0],
          lastTabbable = tabbable[tabbable.length - 1];
        const tabResult = function (e) {
            if (e.target == lastTabbable && !e.shiftKey) {
              e.preventDefault();
              firstTabbable.focus();
            } else if (e.target == firstTabbable && e.shiftKey) {
              e.preventDefault();
              lastTabbable.focus();
            }
          },
          nextResult = function (e) {
            e.preventDefault();
            if (e.target == lastTabbable) {
              firstTabbable.focus();
            } else {
              tabbable.forEach(function (el) {
                if (el == e.target) {
                  tabbable[tabbable.indexOf(el) + 1].focus();
                }
              });
            }
          },
          lastResult = function (e) {
            e.preventDefault();
            if (e.target == firstTabbable) {
              lastTabbable.focus();
            } else {
              tabbable.forEach(function (el) {
                if (el == e.target) {
                  tabbable[tabbable.indexOf(el) - 1].focus();
                }
              });
            }
          };
        searchForm.addEventListener('keydown', function (e) {
          switch (e.key) {
            case KEYS.TAB:
              tabResult(e);
              break;
            case KEYS.ESC:
            case KEYS.ESCAPE:
              emptySearchResults();
              break;
            case KEYS.UP:
            case KEYS.ARROW_UP:
              lastResult(e);
              break;
            case KEYS.DOWN:
            case KEYS.ARROW_DOWN:
              nextResult(e);
              break;
          }
        });
      },
      getSearchResults = function () {
        const request = new XMLHttpRequest();
        const requestUrl =
          '/_hcms/search?&term=' +
          encodeURIComponent(searchTerm) +
          '&limit=' +
          encodeURIComponent(TYPEAHEAD_LIMIT) +
          '&autocomplete=true&analytics=true&' +
          searchOptions();

        request.open('GET', requestUrl, true);
        request.onload = function () {
          if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(request.responseText);
            if (data.total > 0) {
              fillSearchResults(data);
              trapFocus();
            } else {
              emptySearchResults();
            }
          } else {
            console.error('Server reached, error retrieving results.');
          }
        };
        request.onerror = function () {
          console.error('Could not reach the server.');
        };
        request.send();
      },
      isSearchTermPresent = debounce(function () {
        searchTerm = searchField.value;
        if (searchTerm.length > 2) {
          getSearchResults();
        } else if (searchTerm.length === 0) {
          emptySearchResults();
        }
      }, 250),
      // eslint-disable-next-line no-unused-vars
      init = (function () {
        searchField.addEventListener('input', function () {
          if (searchTerm !== searchField.value) {
            isSearchTermPresent();
          }
        });
      })();
  };

  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    const searchResults = document.querySelectorAll(`.${selectors.wrapper}`);
    Array.prototype.forEach.call(searchResults, function (el) {
      hsSearch(el);
    });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      const searchResults = document.querySelectorAll(`.${selectors.wrapper}`);
      Array.prototype.forEach.call(searchResults, function (el) {
        hsSearch(el);
      });
    });
  }
})();
