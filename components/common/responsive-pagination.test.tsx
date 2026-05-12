import { render, screen } from '@testing-library/react';
import {
  CompactPagination,
  FullPagination,
  ResponsivePagination,
} from './responsive-pagination';

const makeHref = (p: number) => `/?page=${p}`;

describe('ResponsivePagination', () => {
  test('totalPages가 1 이하이면 null을 반환한다', () => {
    const totalPages = 1;
    const page = 1;

    const { container } = render(
      <ResponsivePagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
  test('totalPages가 2 이상이면 Compact/Full 래퍼가 함께 렌더된다', () => {
    const totalPages = 2;
    const page = 1;

    render(
      <ResponsivePagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const compact = screen.getByTestId('pagination-compact');
    const full = screen.getByTestId('pagination-full');

    expect(compact).toBeInTheDocument();
    expect(full).toBeInTheDocument();
  });
});

describe('CompactPagination', () => {
  test('현재 페이지/총 페이지를 "page / totalPages" 형태로 표시한다', () => {
    const totalPages = 10;
    const page = 3;

    render(
      <CompactPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const pagination = screen.getByText(`${page} / ${totalPages}`);
    expect(pagination).toBeInTheDocument();
  });
  test('page=1이면 이전(Previous)이 pointer-events-none 래퍼로 감싸져 비활성이고 href는 makeHref(1)이다', () => {
    const totalPages = 10;

    render(
      <CompactPagination
        page={1}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });

    // href는 makeHref(1)
    expect(prevLink).toHaveAttribute('href', makeHref(1));

    // 비활성 처리: wrapper에 aria-disabled가 있어야 함
    const wrapper = prevLink.closest('[aria-disabled="true"]');
    expect(wrapper).not.toBeNull();
  });
  test('page=totalPages이면 이후(Next)가 pointer-events-none 래퍼로 감싸져 비활성이고 href는 makeHref(totalPages)이다', () => {
    const totalPages = 10;

    render(
      <CompactPagination
        page={totalPages}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    // href는 makeHref(totalPages)
    expect(nextLink).toHaveAttribute('href', makeHref(totalPages));

    // 비활성 처리: wrapper에 aria-disabled가 있어야 함
    const wrapper = nextLink.closest('[aria-disabled="true"]');
    expect(wrapper).not.toBeNull();
  });
  test('page가 중간값이면 이전 링크, 다음 링크 href가 makeHref(page-1),makeHref(page+1)로 설정된다', () => {
    const totalPages = 10;
    const page = 5;

    render(
      <CompactPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });
    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    expect(prevLink).toHaveAttribute('href', makeHref(page - 1));
    expect(nextLink).toHaveAttribute('href', makeHref(page + 1));
  });
});

describe('FullPagination', () => {
  test('page=1이면 이전(Previous)이 pointer-events-none 래퍼로 감싸져 비활성이고 href는 makeHref(1)이다', () => {
    const totalPages = 10;

    render(
      <FullPagination page={1} totalPages={totalPages} makeHref={makeHref} />,
    );

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });

    // href는 makeHref(1)
    expect(prevLink).toHaveAttribute('href', makeHref(1));

    // 비활성 처리: wrapper에 aria-disabled가 있어야 함
    const wrapper = prevLink.closest('[aria-disabled="true"]');
    expect(wrapper).not.toBeNull();
  });
  test('page=totalPages이면 이후(Next)가 pointer-events-none 래퍼로 감싸져 비활성이고 href는 makeHref(totalPages)이다', () => {
    const totalPages = 10;

    render(
      <FullPagination
        page={totalPages}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    // href는 makeHref(totalPages)
    expect(nextLink).toHaveAttribute('href', makeHref(totalPages));

    // 비활성 처리: wrapper에 aria-disabled가 있어야 함
    const wrapper = nextLink.closest('[aria-disabled="true"]');
    expect(wrapper).not.toBeNull();
  });
  test('page가 중간값이면 이전 링크, 다음 링크 href가 makeHref(page-1),makeHref(page+1)로 설정된다', () => {
    const totalPages = 10;
    const page = 5;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });
    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    expect(prevLink).toHaveAttribute('href', makeHref(page - 1));
    expect(nextLink).toHaveAttribute('href', makeHref(page + 1));
  });
  test('getPaginationItems 결과의 number 항목은 PaginationLink로 렌더되며 href는 makeHref(item)이다', () => {
    const totalPages = 7;
    const page = 3;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const first = screen.getByRole('link', { name: '1' });
    const last = screen.getByRole('link', { name: `${totalPages}` });
    const current = screen.getByRole('link', { name: `${page}` });

    expect(first).toHaveAttribute('href', makeHref(1));
    expect(last).toHaveAttribute('href', makeHref(totalPages));
    expect(current).toHaveAttribute('href', makeHref(page));
  });
  test('getPaginationItems 결과의 "ellipsis" 항목은 PaginationEllipsis로 렌더된다', () => {
    const totalPages = 30;
    const page = 1;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const ellipses = document.querySelectorAll(
      '[data-slot="pagination-ellipsis"]',
    );
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
  test('현재 page에 해당하는 PaginationLink는 isActive 상태로 렌더된다', () => {
    const totalPages = 10;
    const page = 5;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const current = screen.getByRole('link', { name: String(page) });

    // isActive -> aria-current="page",  data-active="true"
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-active', 'true');
  });
  test('totalPages가 작을 때는 ellipsis 없이 모든 페이지 링크를 렌더한다', () => {
    const totalPages = 3;
    const page = 1;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const ellipses = document.querySelectorAll(
      '[data-slot="pagination-ellipsis"]',
    );
    expect(ellipses.length).toBe(0);

    for (let n = 1; n <= totalPages; n += 1) {
      const link = screen.getByRole('link', { name: String(n) });
      expect(link).toHaveAttribute('href', makeHref(n));
    }
  });
  test('중간 페이지에서는 양쪽 ellipsis가 렌더된다', () => {
    const totalPages = 30;
    const page = 15;

    render(
      <FullPagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />,
    );

    const ellipses = document.querySelectorAll(
      '[data-slot="pagination-ellipsis"]',
    );
    expect(ellipses.length).toBe(2);
  });
});
