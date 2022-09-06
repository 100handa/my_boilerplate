(function () {
  const selectors = {
    wrapper: 'hs-search-results',
    template: 'hs-search-results__template',
    resultNumber: {
      result: 'hs-search-results__total-result-number',
      showing: 'hs-search-results__current-result-number',
    },
    lising: 'hs-search-results__listing',
    pager: {
      wrapper: 'hs-search-results__pagination',
      prev: 'hs-search-results__prev-page',
      next: 'hs-search-results__next-page',
    },
    result: {
      image: 'hs-search-results__featured-image',
      title: 'hs-search-results__title',
      description: 'hs-search-results__description',
    },
    noResults: 'hs-search__no-results',
    input: 'hs-search-field__input',
    customClasses: {
      pager: {
        item: 'bl_pager_item',
      },
      btn: {
        default: 'el_btn',
        inactive: 'is_current',
      },
    },
  };

  const hsResultsPage = function (_resultsClass) {
    function buildResultsPage(_instance) {
      const resultTemplate = _instance.querySelector(`.${selectors.template}`),
        resultsSection = _instance.querySelector(`.${selectors.lising}`),
        searchPath = _instance
          .querySelector(`.${selectors.pager.wrapper}`)
          .getAttribute('data-search-path'),
        resultNumber = _instance.querySelector(
          `.${selectors.resultNumber.result}`
        ),
        showingNumber = _instance.querySelector(
          `.${selectors.resultNumber.showing}`
        ),
        prevLink = _instance.querySelector(`.${selectors.pager.prev}`),
        nextLink = _instance.querySelector(`.${selectors.pager.next}`);

      const searchParams = new URLSearchParams(window.location.search.slice(1));

      function getTerm() {
        return searchParams.get('term') || '';
      }

      function getOffset() {
        return parseInt(searchParams.get('offset')) || 0;
      }

      function getLimit() {
        return parseInt(searchParams.get('limit'));
      }

      function setResultNumber({ total, offset, limit }) {
        const showing = (() => {
          // 1ページ目の処理
          if (total <= limit) return `1〜${total}`;
          if (offset === 0) return `1〜${limit}`;

          return total <= limit + offset
            ? `${offset + 1}〜${total}` // 最終ページの処理
            : `${offset + 1}〜${offset + limit}`;
        })();

        resultNumber.innerHTML = total;
        showingNumber.innerHTML = showing;
      }

      function addResult(title, url, description, featuredImage) {
        const newResult = document.importNode(resultTemplate.content, true);

        function isFeaturedImageEnabled() {
          if (newResult.querySelector(`.${selectors.result.image} > img`)) {
            return true;
          }
        }

        newResult.querySelector(`.${selectors.result.title}`).innerHTML = title;
        newResult.querySelector(`.${selectors.result.title}`).href = url;
        newResult.querySelector(`.${selectors.result.description}`).innerHTML =
          description;
        if (typeof featuredImage !== 'undefined' && isFeaturedImageEnabled()) {
          newResult.querySelector(`.${selectors.result.image} > img`).src =
            featuredImage;
        }
        resultsSection.appendChild(newResult);
      }

      function fillResults(results) {
        results.results.forEach(function (result) {
          addResult(
            result.title,
            result.url,
            result.description,
            result.featuredImageUrl
          );
        });
      }

      function emptyPagination() {
        prevLink.innerHTML = '';
        nextLink.innerHTML = '';
      }

      function emptyResults(searchedTerm) {
        resultsSection.innerHTML =
          `<div class="${selectors.noResults}"><p>"` +
          searchedTerm +
          '"の検索結果が見つかりませんでした。</p>' +
          '<p>検索語句を変更のうえ再度お試しください。</p></div>';
      }

      function setSearchBarDefault(searchedTerm) {
        const searchBars = document.querySelectorAll(`.${selectors.input}`);
        Array.prototype.forEach.call(searchBars, function (el) {
          el.value = searchedTerm;
        });
      }

      function httpRequest() {
        const SEARCH_URL = '/_hcms/search?',
          requestUrl = SEARCH_URL + searchParams + '&analytics=true',
          request = new XMLHttpRequest();

        request.open('GET', requestUrl, true);
        request.onload = function () {
          if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(request.responseText);
            setSearchBarDefault(data.searchTerm);
            if (data.total > 0) {
              setResultNumber(data);
              fillResults(data);
              paginate(data);
            } else {
              emptyResults(data.searchTerm);
              emptyPagination();
            }
          } else {
            console.error('Server reached, error retrieving results.');
          }
        };
        request.onerror = function () {
          console.error('Could not reach the server.');
        };
        request.send();
      }

      function paginate(results) {
        const updatedLimit = getLimit() || results.limit;
        const prevLinkWrapper = prevLink.parentNode;
        const nextLinkWrapper = nextLink.parentNode;

        function hasPreviousPage() {
          return results.page > 0;
        }

        function hasNextPage() {
          return results.offset < results.total - updatedLimit;
        }

        const totalPages = Math.ceil(results.total / results.limit);
        for (let i = 0; i < totalPages; i++) {
          let li = document.createElement('li');
          li.classList.add(selectors.customClasses.pager.item);

          let a = document.createElement('a');
          a.classList.add(selectors.customClasses.btn.default);
          if (results.page === i) {
            a.classList.add(selectors.customClasses.btn.inactive);
          }
          let params = new URLSearchParams(searchParams.toString());
          params.set('offset', results.limit * i);
          a.setAttribute('href', '/' + searchPath + '?' + params);
          a.textContent = i + 1;
          li.appendChild(a);
          nextLinkWrapper.parentNode.insertBefore(li, nextLinkWrapper);
        }

        if (hasPreviousPage()) {
          const prevParams = new URLSearchParams(searchParams.toString());
          prevParams.set(
            'offset',
            results.page * updatedLimit - parseInt(updatedLimit)
          );
          prevLink.href = '/' + searchPath + '?' + prevParams;
          // prevLink.innerHTML = '';
        } else {
          prevLinkWrapper.parentNode.removeChild(prevLinkWrapper);
        }

        if (hasNextPage()) {
          const nextParams = new URLSearchParams(searchParams.toString());
          nextParams.set(
            'offset',
            results.page * updatedLimit + parseInt(updatedLimit)
          );
          nextLink.href = '/' + searchPath + '?' + nextParams;
          // nextLink.innerHTML = '';
        } else {
          nextLinkWrapper.parentNode.removeChild(nextLinkWrapper);
        }
      }

      if (getTerm()) {
        httpRequest(getTerm(), getOffset());
      } else {
        emptyPagination();
      }
    }

    (function () {
      const searchResults = document.querySelectorAll(_resultsClass);
      Array.prototype.forEach.call(searchResults, function (el) {
        buildResultsPage(el);
      });
    })();
  };

  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    hsResultsPage(`.${selectors.wrapper}`);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      hsResultsPage(`.${selectors.wrapper}`);
    });
  }
})();
