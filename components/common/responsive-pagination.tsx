import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPaginationItems } from '@/lib/pagination/getPaginationItems';

type PaginationProps = {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
};

export function ResponsivePagination(props: PaginationProps) {
  if (props.totalPages <= 1) return null;

  return (
    <>
      <div className="sm:hidden" data-testid="pagination-compact">
        <CompactPagination {...props} />
      </div>
      <div className="hidden sm:block" data-testid="pagination-full">
        <FullPagination {...props} />
      </div>
    </>
  );
}

export function CompactPagination({
  page,
  totalPages,
  makeHref,
}: PaginationProps) {
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <Pagination>
      <PaginationContent className="justify-center">
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={makeHref(prevPage)} />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationPrevious href={makeHref(1)} />
            </span>
          )}
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-sm">
            {page} / {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={makeHref(nextPage)} />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationNext href={makeHref(totalPages)} />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function FullPagination({
  page,
  totalPages,
  makeHref,
}: PaginationProps) {
  const items = getPaginationItems(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={makeHref(page - 1)} />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationPrevious href={makeHref(1)} />
            </span>
          )}
        </PaginationItem>

        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={makeHref(item)} isActive={item === page}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={makeHref(page + 1)} />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationNext href={makeHref(totalPages)} />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
