<template>
  <div class="app-container">
   <div class="filter-container">
        <!-- 标题 -->
        <el-input v-model="queryParams.title" placeholder="题目"  class="filter-item search-item"/>
        <!-- 真实姓名 -->
        <el-input v-model="queryParams.fullName" placeholder="真实姓名" class="filter-item search-item"/>
        <!-- 是否已报销 -->
        <el-select  v-model="queryParams.reimbursement"  value="" placeholder="是否已报销" class="filter-item search-item">
          <el-option
            v-for="thesis in whether"
            :key="thesis.id"
            :label="thesis.name"
            :value="thesis.id"
          />
        </el-select>
        <!-- 比赛时间 -->
        <el-date-picker
        v-model="queryParams.time"
        :range-separator="null"
        :start-placeholder="$t('table.user.createTime')"
        value-format="yyyy-MM-dd"
        class="filter-item search-item date-range-item"
        type="daterange"
      /><br/>
        <!-- 搜索 -->
        <el-button class="filter-item" type="primary" plain @click="search">
            {{ $t('table.search') }}
        </el-button>
        <!-- 重置 -->
        <el-button class="filter-item" type="warning" plain @click="reset">
            {{ $t('table.reset') }}
        </el-button>
        <!-- 更多操作 -->
        <el-dropdown v-has-any-permission="['task:add','task:delete','task:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['task:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  <!-- 表格区域 -->
  <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
      @sort-change="sortChange"
      @expand-change="getTeam"
      @row-click="toogleExpand"
    >
      <!-- 展开区域 --> 
        <el-table-column label="详情" type="expand" width="40px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-row>
                <el-col :span="4">
                  <el-form-item label="负责人:">
                    <span>{{ team.reliable }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="成员:">
                    <span>{{ team.member }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="指导老师:">
                    <span>{{ team.teacher }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="发票:">
                    <div class="demo-image" v-if="props.row.invoice">
                      <div class="block" v-for="(item, i) in props.row.invoice.split(',')" :key="i">
                        <el-image
                          :src="item"
                          @click="showpreViewDialog(item)">
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
      <el-table-column type="selection" align="center" width="45px" />
      <!-- 论文标题 -->
      <el-table-column label='标题' prop="title" :show-overflow-tooltip="true" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 论文介绍 -->
      <el-table-column label='论文介绍' prop="introduction" :show-overflow-tooltip="true" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
       <!-- 论文类型 -->
      <el-table-column
            label="论文类型"
            :filters="[{text:'核心', value: '1'},{ text: '普通', value: '2' }]"
            :filter-method="filterPaperType"
            class-name="paperType-col"
            align="center"
            min-width="90px"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.paperType | paperTypeFilter">
                    {{ row.paperType === 1 ? '核心' : '普通' }}
                </el-tag>
            </template>
        </el-table-column>
      <!--创建时间-->
      <el-table-column label='创建时间' prop="time" :show-overflow-tooltip="true" align="center" min-width="120px">
          <template slot-scope="scope">
            <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
       <!-- 论文下载  -->
      <el-table-column label="论文下载" prop="url" :show-overflow-tooltip="true" align="center" min-width="120px">
       <template slot-scope="scope">
          <!-- <span>{{ scope.row.url }}</span> -->
          <a class="el-link el-link--primary" type="primary" @click="upload(scope.row.url)">{{ scope.row.url }}</a>
        </template>
      </el-table-column>
       <!-- 花费  -->
       <el-table-column label="花费" prop="cost" :show-overflow-tooltip="true" align="center" min-width="80px">
          <template slot-scope="scope">
              <span>{{ scope.row.cost }}</span>
          </template>
      </el-table-column>
      <!-- 状态  -->
      <el-table-column
            label="状态"
            :filters="[{text: '进行中', value: 1},{ text: '已完成', value: 2 }]"
            :filter-method="filterState"
            class-name="state-col"
            align="center"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.state | stateFilter">
                    {{ row.state === 2 ? '已完成' : '进行中' }}
                </el-tag>
            </template>
      </el-table-column>
      <!-- 是否已报销  -->
      <el-table-column
            label="是否已报销"
            :filters="[{text: '否', value: 0},{ text: '是', value: 1 }]"
            :filter-method="filterReimbursement"
            class-name="reimbursement-col"
            align="center"
            min-width="110px"
      >
            <template slot-scope="{row}">
                <el-tag :type="row.reimbursement | reimbursementFilter">
                    {{ row.reimbursement === 1 ? '是' : '否' }}
                </el-tag>
            </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
            <el-tooltip
              v-hasPermission="['task:add']"
              class="item"
              effect="dark"
              content="申请报销"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:add']" class="el-icon-coin table-operation" style="color: #87d068;" @click="changeReimbursement(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:update']"
              class="item"
              effect="dark"
              content="修改论文"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:delete']"
              class="item"
              effect="dark"
              content="删除论文"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:view']"
              class="item"
              effect="dark"
              content="查看详情"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:view']" class="el-icon-info table-operation" style="color: #909399;"  @row-click="toogleExpand(row)" />
            </el-tooltip>
            <el-link v-has-no-permission="['task:add','task:view','task:update','task:delete']" class="no-perm">
              {{ $t('tips.noPermission') }}
            </el-link>
          </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <thesis-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <!-- <thesis-view
      ref="view"
      :dialog-visible="userViewVisible"
      @close="viewClose"
    /> -->
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="30%"
      @close="previewDialogClose"
    >
      <el-image :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ThesisEdit from './Edit'
//import ThesisView from './View'
export default {
  name: 'ThesisManage',
  components: { Pagination, ThesisEdit },
  filters: {
    paperTypeFilter(paperType) {
      const map = {
        1: '',
        2: ''
      }
      return map[paperType]
    },
    stateFilter(state) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[state]
    },
    reimbursementFilter(reimbursement) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[reimbursement]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      userViewVisible: false,
      tableKey: 0,
      loading: false,
      list: [],
      total: 0,
      queryParams: { reimbursement: '' },
      sort: {},
      selection: [],
      newWin: null,
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      team: {
        reliable: '',
        member: '',
        teacher: ''
      },
      url: '',
      pagination: {
        size: 10,
        num: 1
      },
      thesisId: '',
      title: '',
      whether: [
        {
          id: 0,
          name: '否'
        },
        {
          id: 1,
          name: '是'
        }
      ]
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        this.url = ''
        this.newWin = null
      }
    }
  },
  created() {
    this.fetch()
  },
  methods: {
    filterPaperType(value, row) {
      return row.paperType === value
    },
    filterState(value, row) {
      return row.state === value
    },
    filterReimbursement(value, row) {
      return row.reimbursement === value
    },
    // viewClose() {
    //   this.userViewVisible = false
    // },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    upload(url) {
      this.newWin = window.open()
      this.url = url
    },
    search() {
      if (this.thesisId !== '') {
        this.getIdInfo(this.thesisId)
        return
      }
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    getIdInfo(id) {
      this.$get(`studio/thesis/${id}`).then((r) => {
        const data = r.data.data
        // data.thesisId = data.thesisId
        const arr = []
        arr.push(data)
        this.list = arr
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    exportExcel() {
      this.$download('studio/task/thesis/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `thesis_${new Date().getTime()}.xlsx`)
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const thesisId = []
        this.selection.forEach((u) => {
          // 不能删除自己xxx
          if (u.thesisId === this.currentUser.thesisId) {
            contain = true
            return
          }
          thesisId.push(u.thesisId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(thesisId)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    getTeam(row) {
      this.view(row)
    },
    delete(thesisIds) {
      this.loading = true
      this.$delete(`studio/thesis/${thesisIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    view(row) {
      this.$get(`studio/thesis/${row.thesisId}`).then((r) => {
        const uResult = []
        const data = r.data.data
        let userId = []
        let userState = []
        if (data.userId && typeof data.userId === 'string') {
          userId = data.userId.split(',')
        }
        if (data.userState && typeof data.userState === 'string') {
          userState = data.userState.split(',')
        }
        // 拿到uesrId及名称
        this.$get('system/user').then((r) => {
          const rows = r.data.data.rows
          rows.forEach((v, i) => {
            userId.forEach((v1, i1) => {
              if (v1 === ('' + v.userId)) {
                uResult.push(v.fullName)
              }
            })
          })
          let reliable = ''
          let member = ''
          let teacher = ''
          userState.forEach((v1, i1) => {
            if (v1 === '1') {
              if (reliable === '') {
                reliable = uResult[i1]
              } else {
                reliable += '，' + uResult[i1]
              }
            }
            if (v1 === '2') {
              if (member === '') {
                member = uResult[i1]
              } else {
                member += '，' + uResult[i1]
              }
            }
            if (v1 === '3') {
              if (teacher === '') {
                teacher = uResult[i1]
              } else {
                teacher += '，' + uResult[i1]
              }
            }
          })
          this.team = {
            reliable,
            member,
            teacher
          }
          // this.$refs.view.setTasks(data)
          // this.taskViewVisible = true
        })
      })
    },
    // checkInvoice(invoice) {
    //   const arr = invoice.split(',') || []
    //   arr.forEach((v1, i) => {
    //     const id = parseInt(v1)
    //     this.$get(`oss/content/download/${id}`).then((r) => {
    //       this.srcList = [...this.srcList, r.data.data]
    //       console.log(this.srcList)
    //     })
    //   })
    // },
    // 弹出申请报销对话框
    changeReimbursement(row) {
      this.$get(`studio/thesis/${row.thesisId}`).then(async(r) => {
        const data = r.data.data
        const userId = data.userId || ''
        // 管理员权限  任务负责人权限
        let flag = this.currentUser.roleId.indexOf('1') === -1
        const fg = userId.indexOf(this.currentUser.userId) !== 0
        if (!flag || !fg) {
          flag = false
        }
        if (flag) {
          return this.$message.info('仅允许管理员或任务负责人操作！')
        }
        // 检查是否已报销
        if (row.reimbursement === 1) {
          return this.$message.info('该论文任务已经报销！')
        }
        // 符合条件，弹出申请报销对话框
        // this.reimbursementDialogVisible = true
        const confirmResult = await this.$confirm(
          '您的报销条件已符合, 是否确认报销?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消了报销')
        }
        this.Funding.applyTime = this.getTime()
        this.Funding.proposerId = this.currentUser.userId
        this.Funding.name = row.title + '论文任务报销'
        console.log(this.Funding)
        this.$router.push({
          name: '经费管理',
          params: {
            Funding: this.Funding
          }
        })
      })
    },
    // 获取时间
    getTime: function() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm =
        new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      const dd =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate()
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    // 手风琴效果
    async toogleExpand(row) {
      await this.view(row)
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.thesisId !== item.thesisId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    edit(row) {
      // 已完成的任务无法修改
      if (parseInt(row.state) === 2) {
        return this.$message.warning('任务已完成无法修改！')
      }
      this.$get(`studio/thesis/${row.thesisId}`).then((r) => {
        const data = r.data.data
        let userId = []
        let userState = []
        if (data.userId && typeof data.userId === 'string') {
          userId = data.userId.split(',')
        }
        if (data.userState && typeof data.userState === 'string') {
          userState = data.userState.split(',')
        }
        let reliable = ''
        let member = ''
        let teacher = ''
        userState.forEach((v1, i1) => {
          if (v1 === '1') {
            if (reliable === '') {
              reliable = userId[i1]
            } else {
              reliable += ',' + userId[i1]
            }
          }
          if (v1 === '2') {
            if (member === '') {
              member = userId[i1]
            } else {
              member += ',' + userId[i1]
            }
          }
          if (v1 === '3') {
            if (teacher === '') {
              teacher = userId[i1]
            } else {
              teacher += ',' + userId[i1]
            }
          }
        })
        row.reliable = reliable
        row.member = member.split(',')
        row.teacher = teacher.split(',')
        this.$refs.edit.setTasks(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.startTime = this.queryParams.timeRange[0]
        params.endTime = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/thesis', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.list.forEach((v, i) => {
          if (v.invoice === null) {
            v.invoice = ''
          }
        })
        this.loading = false
      })
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    },
    sortChange(val) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.invoiceUl {
  list-style: none;
  margin: 0;
}
.invoiceUl .invoiceLi {
  cursor: pointer;
}
.table-expand[data-v-7ec7feb6] {
  display: flex;
}
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 50px;
  height: 50px;
  margin: 0px 10px;
  border:  1px solid #000;
}
</style>
