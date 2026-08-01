-- Ocultar del API las resenas moderadas (la propia siempre visible para su autor)
drop policy "reviews públicas" on public.reviews;
create policy "reviews públicas" on public.reviews for select
  using (not hidden or auth.uid() = author_id);
