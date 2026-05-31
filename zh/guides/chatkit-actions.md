
Actions 是 ChatKit SDK 前端在用户未提交消息的情况下触发流式响应的一种方式。它们也可以用于触发 ChatKit SDK 之外的副作用。

## 触发 actions

### 响应用户与 widgets 的交互

可以通过将 `ActionConfig` 附加到任何支持它的 widget 节点来触发 actions。例如，你可以响应 Button 上的点击事件。当用户点击此按钮时，action 将被发送到你的服务器，你可以在那里更新 widget、运行推理、流式传输新的 thread items 等。

```
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
    )
)
```

Actions 也可以通过前端的 `sendAction()` 以命令式方式发送。当你需要 ChatKit 响应 ChatKit 之外发生的交互时，这可能最为有用，但它也可以用于在需要同时在客户端和服务器端响应时链接 actions（下面会详细介绍）。

```javascript
await chatKit.sendAction({
  type: "example",
  payload: { id: 123 },
});
```

## 处理 actions

### 在服务器端

默认情况下，actions 会被发送到你的服务器。你可以通过在 `ChatKitServer` 上实现 `action` 方法来在服务器端处理 actions。

```text
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if action.type == "example":
          await do_thing(action.payload['id'])

          # often you'll want to add a HiddenContextItem so the model
          # can see that the user did something
          await self.store.add_thread_item(
              thread.id,
              HiddenContextItem(
                  id="item_123",
                  created_at=datetime.now(),
                  content=(
                      "&lt;USER_ACTION>The user did a thing&lt;/USER_ACTION>"
                  ),
              ),
              context,
          )

          # then you might want to run inference to stream a response
          # back to the user.
          async for e in self.generate(context, thread):
              yield e
```

**注意：** 与任何客户端/服务器交互一样，actions 及其 payloads 由客户端发送，应被视为不可信数据。

### 客户端

有时你会希望在客户端集成中处理 actions。为此，你需要通过在 `ActionConfig` 中添加 `handler="client"` 来指定 action 应发送到客户端的 action 处理器。

```
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
      handler="client"
    )
)
```

然后，当 action 被触发时，它将被传递给你在实例化 ChatKit 时提供的回调函数。

```text
async function handleWidgetAction(action: {type: string, Record&lt;string, unknown>}) {
  if (action.type === "example") {
    const res = await doSomething(action)

    // You can fire off actions to your server from here as well.
    // e.g. if you want to stream new thread items or update a widget.
    await chatKit.sendAction({
      type: "example_complete",
      payload: res
    })
  }
}

chatKit.setOptions({
  // other options...
  widgets: { onAction: handleWidgetAction }
})
```

## 强类型 actions

默认情况下 `Action` 和 `ActionConfig` 不是强类型的。但是，我们在 `Action` 上暴露了一个 `create` 辅助方法，使得从一组强类型 actions 生成 `ActionConfig` 变得简单。

```python
class ExamplePayload(BaseModel)
    id: int

ExampleAction = Action[Literal["example"], ExamplePayload]
OtherAction = Action[Literal["other"], None]

AppAction = Annotated[
  ExampleAction
  | OtherAction,
  Field(discriminator="type"),
]

ActionAdapter: TypeAdapter[AppAction] = TypeAdapter(AppAction)

def parse_app_action(action: Action[str, Any]): AppAction
  return ActionAdapter.model_validate(action)

# Usage in a widget
# Action provides a create helper which makes it easy to generate
# ActionConfigs from strongly typed actions.
Button(
    label="Example",
    onClickAction=ExampleAction.create(ExamplePayload(id=123))
)

# usage in action handler
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        # add custom error handling if needed
        app_action = parse_app_action(action)
        if (app_action.type == "example"):
            await do_thing(app_action.payload.id)
```

## 使用 widgets 和 actions 创建自定义表单

当接受用户输入的 widget 节点被挂载在 `Form` 内部时，这些字段的值将包含在所有源自该 `Form` 内部的 actions 的 `payload` 中。

表单值在 `payload` 中以其 `name` 作为键，例如：

*   `Select(name="title")` → `action.payload.title`
*   `Select(name="todo.title")` → `action.payload.todo.title`

```python
Form(
	direction="col",
	validation="native"
  onSubmitAction=ActionConfig(
	  type="update_todo",
	  payload={"id": todo.id}
  ),
  children=[
    Title(value="Edit Todo"),

    Text(value="Title", color="secondary", size="sm"),
    Text(
      value=todo.title,
      editable=EditableProps(name="title", required=True),
    )

    Text(value="Description", color="secondary", size="sm"),
    Text(
      value=todo.description,
      editable=EditableProps(name="description"),
    ),

    Button(label="Save", type="submit")
  ]
)

class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if (action.type == "update_todo"):
          id = action.payload['id']
          # Any action that originates from within the Form will
          # include title and description
          title = action.payload['title']
          description = action.payload['description']

	        # ...
```

### 验证

`Form` 使用基本的原生表单验证；在配置了 `required` 和 `pattern` 的字段上强制执行这些规则，并在表单存在任何无效字段时阻止提交。

我们未来可能会添加具有更好用户体验、更具表达力的验证、自定义错误显示等功能的新验证模式。在此之前，widgets 不是复杂表单和棘手验证的理想媒介。如果你有这种需求，更好的模式是使用客户端 action 处理来触发模态框，在那里显示自定义表单，然后通过 `sendAction` 将结果传回 ChatKit。

### 将 `Card` 作为 `Form` 使用

你可以向 `Card` 传递 `asForm=True`，它将表现为一个 `Form`，运行验证并将收集的字段传递给 Card 的 `confirm` action。

### Payload 键冲突

如果与 payload 上某个已有的预定义键存在命名冲突，表单值将被忽略。这可能是一个 bug，因此当我们检测到这种情况时会发出一个 `error` 事件。

## 控制 widgets 中的加载状态交互

使用 `ActionConfig.loadingBehavior` 来控制 actions 如何在 widget 中触发不同的加载状态。

```
Button(
    label="This make take a while...",
    onClickAction=ActionConfig(
      type="long_running_action_that_should_block_other_ui_interactions",
      loadingBehavior="container"
    )
)
```

| 值 | 行为 |
| --- | --- |
| `auto` | action 将根据其使用方式进行适配。（_默认值_） |
| `self` | action 在绑定该 action 的 widget 节点上触发加载状态。 |
| `container` | action 在整个 widget 容器上触发加载状态。这会导致 widget 略微淡出并变为惰性状态。 |
| `none` | 无加载状态 |

### 使用 `auto` 行为

通常，我们建议使用 `auto`，这也是默认值。`auto` 根据 action 绑定的位置触发加载状态，例如：

*   `Button.onClickAction` → `self`
*   `Select.onChangeAction` → `none`
*   `Card.confirm.action` → `container`
