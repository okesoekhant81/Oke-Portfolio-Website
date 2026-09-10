export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Homepage')
        .id('homepage')
        .child(
          S.document().schemaType('homepage').documentId('homepage').title('Homepage')
        ),
      S.divider(),
      S.documentTypeListItem('post').title('Articles'),
    ])
