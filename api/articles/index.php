<?php
// Convert RSS feed to JSON, stripping out all but basic HTML
// Using Guardian Technology feed as it contains the full content
$rss = new SimpleXMLElement(file_get_contents('http://www.guardian.co.uk/technology/mobilephones/rss'));


$articleId = intval(isset($_GET['id']) ? $_GET['id'] : 0);
if ($articleId) {
  $xpath = '/rss/channel/item['. $articleId .']';
} else {
  $xpath = '/rss/channel/item';
}
$items = $rss->xpath($xpath);

if ($items) {
  $output = array();
  foreach ($items as $id => $item) {

    // This will be encoded as an object, not an array, by json_encode
    $output[] = array(
      'id' => $id + 1,
      'headline' => strval($item->title),
      'date' => strval($item->pubDate),
      'body' => strval(strip_tags($item->description,'<p><br>')),
      'author' => strval($item->children('http://purl.org/dc/elements/1.1/')->creator)
    );
  }

  if ($articleId > 0) {
    echo json_encode($output[0]);
  } else {
    echo json_encode($output);
  }
}
